import type { Organization } from '$lib/types/domain';
import type {
	OrganizationIdRequest,
	CreateOrganizationRequest,
	UpdateOrganizationRequest,
	UpdateOrganizationStateRequest
} from '$lib/types/services';
import type { TypedSupabaseClient } from '$lib/types/db';
import { adaptOrganizationFromDb } from '$lib/adapters';

/**
 * Get all organizations with event count.
 * Returns domain Organization types with camelCase fields.
 * Returns organizations in all states (WAITING_OWNER, ACTIVE, DISABLED).
 * Filtered by RLS - admins see all, public sees only ACTIVE via RLS policy.
 * Includes aggregated event count for list view.
 */
export async function getAllOrganizations(supabase: TypedSupabaseClient): Promise<Organization[]> {
	// Query organizations with event count aggregation
	const { data, error } = await supabase
		.from('organizations')
		.select(
			`
			*,
			events:events(count)
		`
		)
		.order('name', { ascending: true });

	if (error) {
		throw new Error(`Error fetching organizations: ${error.message}`);
	}

	// Transform DB types → Domain types and add event count
	return (data || []).map((org) => {
		const adapted = adaptOrganizationFromDb(org);
		// Add event count from aggregation
		return {
			...adapted,
			eventCount: org.events?.[0]?.count ?? 0
		};
	});
}

/**
 * Get single organization by ID (UUID).
 * Returns domain Organization type with camelCase fields.
 * Returns null if organization not found.
 * Returns organization in any state (WAITING_OWNER, ACTIVE, DISABLED).
 * Includes event count for consistency with list view.
 */
export async function getOrganizationById(
	supabase: TypedSupabaseClient,
	params: OrganizationIdRequest
): Promise<Organization | null> {
	const { data, error } = await supabase
		.from('organizations')
		.select(
			`
			*,
			events:events(count)
		`
		)
		.eq('id', params.id)
		.single();

	if (error) {
		// PGRST116 = no rows found - expected when organization doesn't exist
		if (error.code === 'PGRST116') {
			return null;
		}
		// Other errors are unexpected - throw them
		throw new Error(`Error fetching organization: ${error.message}`);
	}

	if (!data) return null;

	// Transform DB type → Domain type and add event count
	const adapted = adaptOrganizationFromDb(data);
	return {
		...adapted,
		eventCount: data.events?.[0]?.count ?? 0
	};
}

/**
 * Create a new organization.
 * Returns domain Organization type with camelCase fields.
 * State defaults to ACTIVE if not provided, or WAITING_OWNER if creating with invitation.
 */
export async function createOrganization(
	supabase: TypedSupabaseClient,
	params: CreateOrganizationRequest
): Promise<Organization> {
	const { data, error } = await supabase
		.from('organizations')
		.insert({
			name: params.name,
			description: params.description ?? null,
			state: params.state ?? 'ACTIVE' // Default to ACTIVE, or WAITING_OWNER for invitations
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Error creating organization: ${error.message}`);
	}

	if (!data) {
		throw new Error('No data returned after creating organization');
	}

	return adaptOrganizationFromDb(data);
}

/**
 * Update an existing organization by ID (UUID).
 * Returns domain Organization type with camelCase fields.
 * Only provided fields will be updated (partial update).
 */
export async function updateOrganization(
	supabase: TypedSupabaseClient,
	params: UpdateOrganizationRequest
): Promise<Organization> {
	// Build update object with only provided fields
	const updateData: Record<string, string | null> = {};
	if (params.name !== undefined) updateData.name = params.name;
	if (params.description !== undefined) updateData.description = params.description;

	const { data, error } = await supabase
		.from('organizations')
		.update(updateData)
		.eq('id', params.id)
		.select()
		.single();

	if (error) {
		// PGRST116 = no rows found - organization doesn't exist
		if (error.code === 'PGRST116') {
			throw new Error(`Organization with ID ${params.id} not found`);
		}
		throw new Error(`Error updating organization: ${error.message}`);
	}

	if (!data) {
		throw new Error('No data returned after updating organization');
	}

	return adaptOrganizationFromDb(data);
}

/**
 * Updates the state of an organization.
 * Used to transition between WAITING_OWNER, ACTIVE, and DISABLED states.
 */
export async function updateOrganizationState(
	supabase: TypedSupabaseClient,
	params: UpdateOrganizationStateRequest
): Promise<Organization> {
	const { data, error } = await supabase
		.from('organizations')
		.update({ state: params.state })
		.eq('id', params.id)
		.select()
		.single();

	if (error) {
		if (error.code === 'PGRST116') {
			throw new Error(`Organization with ID ${params.id} not found`);
		}
		throw new Error(`Error updating organization state: ${error.message}`);
	}

	if (!data) {
		throw new Error('No data returned after updating organization state');
	}

	return adaptOrganizationFromDb(data);
}

/**
 * Soft delete an organization by ID (UUID).
 * Sets state to DISABLED instead of deleting the record.
 */
export async function deleteOrganization(
	supabase: TypedSupabaseClient,
	params: OrganizationIdRequest
): Promise<void> {
	const { error } = await supabase
		.from('organizations')
		.update({ state: 'DISABLED' })
		.eq('id', params.id);

	if (error) {
		throw new Error(`Error deleting organization: ${error.message}`);
	}
}

/**
 * Deactivates an organization by ID (UUID).
 * Sets state to DISABLED. This is similar to deleteOrganization but intended
 * for use with cleanup logic in the server action.
 */
export async function deactivateOrganization(
	supabase: TypedSupabaseClient,
	params: OrganizationIdRequest
): Promise<void> {
	const { error } = await supabase
		.from('organizations')
		.update({ state: 'DISABLED' })
		.eq('id', params.id);

	if (error) {
		throw new Error(`Error deactivating organization: ${error.message}`);
	}
}

/**
 * Activates a DISABLED organization by ID (UUID).
 * Sets state to ACTIVE.
 */
export async function activateOrganization(
	supabase: TypedSupabaseClient,
	params: OrganizationIdRequest
): Promise<void> {
	const { error } = await supabase
		.from('organizations')
		.update({ state: 'ACTIVE' })
		.eq('id', params.id);

	if (error) {
		throw new Error(`Error activating organization: ${error.message}`);
	}
}

/**
 * Permanently deletes an organization by ID (UUID).
 * This is a hard delete that removes the record from the database.
 * CASCADE rules will automatically handle related records.
 *
 * WARNING: This is destructive and cannot be undone!
 * Only use for DISABLED organizations with no events or members.
 */
export async function permanentlyDeleteOrganization(
	supabase: TypedSupabaseClient,
	params: OrganizationIdRequest
): Promise<void> {
	const { error } = await supabase.from('organizations').delete().eq('id', params.id);

	if (error) {
		throw new Error(`Error permanently deleting organization: ${error.message}`);
	}
}

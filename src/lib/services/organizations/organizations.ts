import type { Organization, PartialOrganization } from '$lib/types/domain';
import type { OrganizationIdRequest, CreateOrganizationRequest } from '$lib/types/services';
import type { TypedSupabaseClient, OrganizationTableDB } from '$lib/types/db';
import { adaptOrganizationFromDb, adaptOrganizationFromDomain } from '$lib/adapters';

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
 * Supports updating: name, description, and state.
 */
export async function updateOrganization(
	supabase: TypedSupabaseClient,
	organizationId: string,
	updates: PartialOrganization
): Promise<Organization> {
	// Use adapter to transform domain type to database format
	const rpcUpdates = adaptOrganizationFromDomain(updates);

	// Call RPC function with organization ID and updates
	const { data, error } = await supabase.rpc('update_organization', {
		p_organization_id: organizationId,
		p_updates: rpcUpdates
	});

	if (error) {
		// P0002 = no_data_found - organization doesn't exist
		if (error.code === 'P0002') {
			throw new Error(`Organization with ID ${organizationId} not found`);
		}
		throw new Error(`Error updating organization: ${error.message}`);
	}

	// RPC returns array from RETURNS TABLE, extract first element
	const updatedOrg = data?.[0];
	if (!updatedOrg) {
		throw new Error('No data returned after updating organization');
	}

	// Adapt auto-typed result to domain type (cast to OrganizationTableDB for adapter compatibility)
	return adaptOrganizationFromDb(updatedOrg as OrganizationTableDB);
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

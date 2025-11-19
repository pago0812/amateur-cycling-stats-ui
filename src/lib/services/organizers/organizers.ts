import type { OrganizerWithRelations } from '$lib/types/services';
import type { OrganizerWithUserResponse, TypedSupabaseClient } from '$lib/types/db';
import { adaptOrganizerWithUserFromDb } from '$lib/adapters';

interface GetOrganizersByOrganizationIdParams {
	organizationId: string;
}

/**
 * Get all organizers for a specific organization with user and role information.
 * Returns domain OrganizerWithRelations types with camelCase fields.
 * Includes user details and role names for members table display.
 */
export async function getOrganizersByOrganizationId(
	supabase: TypedSupabaseClient,
	params: GetOrganizersByOrganizationIdParams
): Promise<OrganizerWithRelations[]> {
	// Query organizers with user and role relations
	const { data, error } = await supabase
		.from('organizers')
		.select(
			`
			*,
			users:user_id (
				id,
				first_name,
				last_name,
				role_id,
				created_at,
				updated_at,
				roles:role_id (
					id,
					name,
					created_at,
					updated_at
				)
			)
		`
		)
		.eq('organization_id', params.organizationId)
		.order('created_at', { ascending: false });

	if (error) {
		throw new Error(`Error fetching organizers: ${error.message}`);
	}

	// Transform DB types → Domain types
	return (data || []).map((organizer) =>
		adaptOrganizerWithUserFromDb(organizer as OrganizerWithUserResponse)
	);
}

/**
 * Get the count of organizers (members) for a specific organization.
 * Used to check if organization has any members before allowing permanent deletion.
 *
 * @param supabase - Typed Supabase client
 * @param organizationId - Organization UUID
 * @returns Count of organizers
 */
export async function getOrganizersCountByOrganizationId(
	supabase: TypedSupabaseClient,
	organizationId: string
): Promise<number> {
	const { count, error } = await supabase
		.from('organizers')
		.select('*', { count: 'exact', head: true })
		.eq('organization_id', organizationId);

	if (error) {
		console.error('[Organizers] Failed to count organizers:', error);
		throw new Error(`Failed to count organizers: ${error.message}`);
	}

	return count ?? 0;
}

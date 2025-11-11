import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { OrganizerWithRelations } from '$lib/types/domain';
import type { OrganizerWithUserResponse } from '$lib/types/db';
import { adaptOrganizerWithUserFromDb } from '$lib/adapters';

type TypedSupabaseClient = SupabaseClient<Database>;

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
				short_id,
				first_name,
				last_name,
				role_id,
				created_at,
				updated_at,
				roles:role_id (
					id,
					short_id,
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

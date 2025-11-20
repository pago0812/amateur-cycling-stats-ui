import type { TypedSupabaseClient } from '$lib/types/db';
import type { Organizer } from '$lib/types/domain/organizer.domain';
import { adaptOrganizerFromRpc } from '$lib/adapters';

interface GetOrganizersByOrganizationIdParams {
	organizationId: string;
}

/**
 * Get all organizers for a specific organization.
 * Returns domain Organizer types with flattened structure.
 * Used for members table display.
 */
export async function getOrganizersByOrganizationId(
	supabase: TypedSupabaseClient,
	params: GetOrganizersByOrganizationIdParams
): Promise<Organizer[]> {
	const { data, error } = await supabase.rpc('get_organizers_by_organization_id', {
		p_organization_id: params.organizationId
	});

	if (error) {
		throw new Error(`Error fetching organizers: ${error.message}`);
	}

	// RPC returns auto-typed array from RETURNS TABLE
	return (data || []).map(adaptOrganizerFromRpc);
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

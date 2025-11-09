import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { Organization } from '$lib/types/domain';
import { adaptOrganizationFromDb } from '$lib/adapters';

type TypedSupabaseClient = SupabaseClient<Database>;

interface GetOrganizationByIdParams {
	id: string;
}

/**
 * Get all active organizations with event count.
 * Returns domain Organization types with camelCase fields.
 * Filters only active organizations (is_active = true) via RLS.
 * Includes aggregated event count for list view.
 */
export async function getAllOrganizations(
	supabase: TypedSupabaseClient
): Promise<Organization[]> {
	// Query organizations with event count aggregation
	const { data, error } = await supabase
		.from('organizations')
		.select(`
			*,
			events:events(count)
		`)
		.eq('is_active', true)
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
 * Get single organization by ID (short_id).
 * Returns domain Organization type with camelCase fields.
 * Returns null if organization not found or inactive.
 * Includes event count for consistency with list view.
 */
export async function getOrganizationById(
	supabase: TypedSupabaseClient,
	params: GetOrganizationByIdParams
): Promise<Organization | null> {
	const { data, error } = await supabase
		.from('organizations')
		.select(`
			*,
			events:events(count)
		`)
		.eq('short_id', params.id)
		.eq('is_active', true)
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

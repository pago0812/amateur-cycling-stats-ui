import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { RaceWithRelations } from '$lib/types/domain';
import type { RaceWithResultsResponse } from '$lib/types/db';
import { adaptRaceWithResultsFromDb } from '$lib/adapters';

type TypedSupabaseClient = SupabaseClient<Database>;

interface GetRaceWithFiltersParams {
	eventId: string; // CRITICAL: Must filter by event to prevent returning races from other events
	categoryId: string;
	genderId: string;
	lengthId: string;
}

/**
 * Get race with results filtered by event, category, gender, and length.
 *
 * Single PostgreSQL query with JOINs - much faster than Strapi's N+1 queries.
 * Uses automatic RLS policies for visibility filtering.
 *
 * @returns RaceWithRelations if found, null if no race matches the filters
 * @throws Error only for unexpected database errors (not for missing races)
 */
export async function getRaceWithResultsWithFilters(
	supabase: TypedSupabaseClient,
	params: GetRaceWithFiltersParams
): Promise<RaceWithRelations | null> {
	const { data, error } = await supabase
		.from('races')
		.select(
			`
			*,
			race_results(
				*,
				cyclists(*),
				ranking_points(*)
			)
		`
		)
		.eq('event_id', params.eventId) // CRITICAL FIX: Filter by event
		.eq('race_category_id', params.categoryId)
		.eq('race_category_gender_id', params.genderId)
		.eq('race_category_length_id', params.lengthId)
		.order('place', { referencedTable: 'race_results', ascending: true })
		.single(); // Ensure exactly one result

	if (error) {
		// PGRST116 = no rows found - this is expected when race doesn't exist for this combination
		if (error.code === 'PGRST116') {
			return null;
		}
		// Other errors are unexpected - throw them
		console.error('Unexpected error fetching race:', error);
		throw new Error(`Error fetching race: ${error.message}`);
	}

	if (!data) {
		return null;
	}

	// Use adapter to transform complex response → Domain type
	return adaptRaceWithResultsFromDb(data as RaceWithResultsResponse);
}

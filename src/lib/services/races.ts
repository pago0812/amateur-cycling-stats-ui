import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { RaceWithRelations, RaceDetailResult } from '$lib/types/domain';
import type { RaceWithResultsResponse } from '$lib/types/db';
import { adaptRaceWithResultsFromDb } from '$lib/adapters';

type TypedSupabaseClient = SupabaseClient<Database>;

interface GetRaceWithFiltersParams {
	eventId: string; // Event's short_id (from URL) - will be converted to UUID internally
	categoryId: string;
	genderId: string;
	lengthId: string;
}

/**
 * Race with results type - used for race detail pages.
 * Extends RaceWithRelations with raceResults array.
 */
export type RaceWithResults = RaceWithRelations & {
	raceResults: RaceDetailResult[];
};

/**
 * Get race with results filtered by event, category, gender, and length.
 *
 * Single PostgreSQL query with JOINs - much faster than Strapi's N+1 queries.
 * Uses automatic RLS policies for visibility filtering.
 *
 * All ID parameters are short_ids (public IDs), not UUIDs.
 * Function converts short_ids → UUIDs internally for database queries.
 *
 * @returns RaceWithResults if found, null if no race matches the filters
 * @throws Error only for unexpected database errors (not for missing races)
 */
export async function getRaceWithResultsWithFilters(
	supabase: TypedSupabaseClient,
	params: GetRaceWithFiltersParams
): Promise<RaceWithResults | null> {
	// Look up all UUIDs from short_ids in parallel
	const [eventResult, categoryResult, genderResult, lengthResult] = await Promise.all([
		supabase.from('events').select('id').eq('short_id', params.eventId).single(),
		supabase.from('race_categories').select('id').eq('short_id', params.categoryId).single(),
		supabase.from('race_category_genders').select('id').eq('short_id', params.genderId).single(),
		supabase.from('race_category_lengths').select('id').eq('short_id', params.lengthId).single()
	]);

	// Check if any lookup failed
	if (eventResult.error || categoryResult.error || genderResult.error || lengthResult.error) {
		// If any entity doesn't exist, race can't exist either - return null
		if (
			eventResult.error?.code === 'PGRST116' ||
			categoryResult.error?.code === 'PGRST116' ||
			genderResult.error?.code === 'PGRST116' ||
			lengthResult.error?.code === 'PGRST116'
		) {
			return null;
		}
		// Other errors are unexpected
		throw new Error(
			`Error looking up entities: ${eventResult.error?.message || categoryResult.error?.message || genderResult.error?.message || lengthResult.error?.message}`
		);
	}

	if (!eventResult.data || !categoryResult.data || !genderResult.data || !lengthResult.data) {
		return null;
	}

	const uuids = {
		eventId: eventResult.data.id,
		categoryId: categoryResult.data.id,
		genderId: genderResult.data.id,
		lengthId: lengthResult.data.id
	};

	// Query races using the UUIDs
	const { data, error } = await supabase
		.from('races')
		.select(
			`
			*,
			race_results(
				*,
				cyclists(
					*,
					users(*)
				),
				ranking_points(*)
			)
		`
		)
		.eq('event_id', uuids.eventId) // Use UUIDs for filtering
		.eq('race_category_id', uuids.categoryId)
		.eq('race_category_gender_id', uuids.genderId)
		.eq('race_category_length_id', uuids.lengthId)
		.order('place', { referencedTable: 'race_results', ascending: true })
		.single(); // Ensure exactly one result

	if (error) {
		// PGRST116 = no rows found - this is expected when race doesn't exist for this combination
		if (error.code === 'PGRST116') {
			return null;
		}
		// Other errors are unexpected - throw them
		throw new Error(`Error fetching race: ${error.message}`);
	}

	if (!data) {
		return null;
	}

	// Use adapter to transform complex response → Domain type
	return adaptRaceWithResultsFromDb(data as RaceWithResultsResponse);
}

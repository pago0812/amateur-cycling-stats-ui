import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { RaceResultWithRelations } from '$lib/types/domain';
import type { RaceResultWithRelationsResponse } from '$lib/types/db';
import { adaptRaceResultWithRelationsFromDb } from '$lib/adapters';

type TypedSupabaseClient = SupabaseClient<Database>;

interface GetRaceResultsByRaceIdParams {
	raceId: string;
}

/**
 * Get race results by race ID with populated cyclist and ranking point data.
 *
 * Single PostgreSQL query with JOINs - much faster than Strapi's N+1 queries.
 * Results are automatically sorted by place (ascending).
 */
export async function getRaceResultsByRaceId(
	supabase: TypedSupabaseClient,
	params: GetRaceResultsByRaceIdParams
): Promise<RaceResultWithRelations[]> {
	const { data, error } = await supabase
		.from('race_results')
		.select(
			`
			*,
			cyclists(*),
			ranking_points(*)
		`
		)
		.eq('race_id', params.raceId)
		.order('place', { ascending: true });

	if (error) {
		throw new Error(`Error fetching race results: ${error.message}`);
	}

	// Use adapter to transform DB types → Domain types
	return (data || []).map((result) =>
		adaptRaceResultWithRelationsFromDb(result as RaceResultWithRelationsResponse)
	);
}

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { RaceResultWithRelations } from '$lib/types/domain';
import type { RaceResultWithRelationsResponse, RaceResultRpcItem } from '$lib/types/db';
import { adaptRaceResultWithRelationsFromDb, adaptRaceResultFromRpc } from '$lib/adapters';

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

interface GetRaceResultsByUserIdParams {
	userId: string;
}

/**
 * Get race results by user ID (user's short_id).
 *
 * Optimized RPC function that fetches ONLY race results for a user.
 * Use this when you already have user/cyclist data and only need their race history.
 * Results include full race, event, category, and ranking details.
 * Automatically sorted by event date (most recent first).
 *
 * @param userId - The user's short_id (in domain it's just 'id')
 * @returns Array of race results with full race/event details, or empty array if user has no results
 */
export async function getRaceResultsByUserId(
	supabase: TypedSupabaseClient,
	params: GetRaceResultsByUserIdParams
): Promise<RaceResultWithRelations[]> {
	const { data, error } = await supabase.rpc('get_race_results_by_user_short_id', {
		p_user_short_id: params.userId
	});

	if (error) {
		throw new Error(`Error fetching race results: ${error.message}`);
	}

	// RPC returns JSONB array, we need to cast it properly
	const results = (data as unknown as RaceResultRpcItem[]) || [];

	// Use adapter to transform RPC response → Domain types
	return results.map((result) => adaptRaceResultFromRpc(result));
}

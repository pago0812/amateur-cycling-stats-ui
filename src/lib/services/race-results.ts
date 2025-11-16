import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { RaceResult } from '$lib/types/domain';
import type { RaceResultRpcItem } from '$lib/types/db';
import { adaptRaceResultsFromRpc } from '$lib/adapters';

type TypedSupabaseClient = SupabaseClient<Database>;

interface GetRaceResultsByUserIdParams {
	userId: string;
}

/**
 * Get race results by user ID (user's short_id) with flat structure.
 *
 * Optimized RPC function that returns flattened race results for a user.
 * Use this when you already have user/cyclist data and only need their race history.
 * Results include flattened event, race, and category data for optimal performance.
 * Automatically sorted by event date (most recent first).
 *
 * @param userId - The user's short_id (in domain it's just 'id')
 * @returns Array of race results with flat structure, or empty array if user has no results
 */
export async function getRaceResultsByUserId(
	supabase: TypedSupabaseClient,
	params: GetRaceResultsByUserIdParams
): Promise<RaceResult[]> {
	const { data, error } = await supabase.rpc('get_race_results_by_user_short_id', {
		p_user_short_id: params.userId
	});

	if (error) {
		throw new Error(`Error fetching race results: ${error.message}`);
	}

	// RPC returns JSONB array, cast to proper type and handle null
	return adaptRaceResultsFromRpc((data as unknown as RaceResultRpcItem[]) ?? []);
}

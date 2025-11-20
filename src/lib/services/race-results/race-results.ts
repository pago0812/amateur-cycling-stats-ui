import type { RaceResult } from '$lib/types/domain';
import type { TypedSupabaseClient } from '$lib/types/db';
import { adaptRaceResultsFromRpc } from '$lib/adapters';

interface GetRaceResultsByUserIdParams {
	userId: string;
}

/**
 * Get race results by user ID with flat structure.
 *
 * Optimized RPC function that returns flattened race results for a user.
 * Use this when you already have user/cyclist data and only need their race history.
 * Results include flattened event, race, and category data for optimal performance.
 * Automatically sorted by event date (most recent first).
 *
 * @param userId - The user's UUID
 * @returns Array of race results with flat structure, or empty array if user has no results
 */
export async function getRaceResultsByUserId(
	supabase: TypedSupabaseClient,
	params: GetRaceResultsByUserIdParams
): Promise<RaceResult[]> {
	const { data, error } = await supabase.rpc('get_race_results_by_user_id', {
		p_user_id: params.userId
	});

	if (error) {
		throw new Error(`Error fetching race results: ${error.message}`);
	}

	// RPC returns auto-typed array from RETURNS TABLE
	return adaptRaceResultsFromRpc(data ?? []);
}

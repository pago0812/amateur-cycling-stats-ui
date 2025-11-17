import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { RaceWithRaceResults } from '$lib/types/services/races';
import type { RpcRaceWithResultsResponse } from '$lib/types/db';
import { adaptRaceWithRaceResultsFromRpc } from '$lib/adapters';

type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Get race with race results by race ID using RPC function.
 *
 * Uses PostgreSQL RPC function for optimized single-query data fetching.
 * Automatically respects RLS policies for visibility filtering.
 *
 * @param id - Race's UUID
 * @returns RaceWithRaceResults if found, null if race doesn't exist
 * @throws Error only for unexpected database errors
 */
export async function getRaceWithRaceResultsById(
	supabase: TypedSupabaseClient,
	{ id }: { id: string }
): Promise<RaceWithRaceResults | null> {
	const { data, error } = await supabase.rpc('get_race_with_results_by_id', {
		p_race_id: id
	});

	if (error) {
		throw new Error(`Error fetching race with results: ${error.message}`);
	}

	// RPC returns null if race doesn't exist
	if (!data) {
		return null;
	}

	// Type cast JSONB response and adapt to domain type
	return adaptRaceWithRaceResultsFromRpc(data as unknown as RpcRaceWithResultsResponse);
}

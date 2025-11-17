import type { Race } from '$lib/types/domain';

/**
 * Service Response Types for Races
 *
 * These types represent structures returned by race service methods and RPC functions.
 * They are aggregated/nested structures optimized for specific use cases.
 */

/**
 * Race detail result type - used for displaying results on race detail pages.
 * Partial result data (only essential fields) since event/race context is already known.
 * Includes cyclistId for linking to cyclist profiles and cyclist name for display.
 */
export interface RaceDetailResult {
	id: string;
	place: number;
	time: string | null;
	points: number | null;
	cyclistId: string;
	cyclistFirstName: string;
	cyclistLastName: string;
	createdAt: string;
	updatedAt: string;
	rankingPoint?: {
		id: string;
		place: number;
		points: number;
		raceRankingId: string;
	};
}

/**
 * Race with race results.
 * Returned by getRaceWithRaceResultsById() service (via get_race_with_results_by_id RPC).
 * Used when fetching race data with nested race results for race detail pages.
 */
export interface RaceWithRaceResults extends Race {
	// Nested race results
	raceResults: RaceDetailResult[];
}

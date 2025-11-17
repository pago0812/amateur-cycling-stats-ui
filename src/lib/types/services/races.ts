import type { Race } from '$lib/types/domain';

// ============================================================================
// Response Types
// ============================================================================

/**
 * Race detail result type - used for displaying results on race detail pages.
 *
 * Partial result data (only essential fields) since event/race context is already known.
 * Includes cyclistId for linking to cyclist profiles and cyclist name for display.
 *
 * Used by:
 * - RaceWithRaceResults.raceResults (nested in race detail response)
 * - /results/[id]/+page.server.ts (via getRaceWithResultsWithFilters)
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
 * Race with nested race results.
 *
 * This aggregated type is returned by getRaceWithRaceResultsById() service
 * (via get_race_with_results_by_id RPC).
 *
 * Aggregation rationale:
 * - Fetches race + all results in single database round-trip
 * - Includes cyclist names directly (no N+1 query problem)
 * - Optimized for race detail pages showing results table
 *
 * Used by:
 * - /results/[id]/+page.server.ts (race detail section of event page)
 */
export interface RaceWithRaceResults extends Race {
	// Nested race results
	raceResults: RaceDetailResult[];
}

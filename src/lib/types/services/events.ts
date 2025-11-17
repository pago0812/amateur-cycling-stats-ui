import type { Event } from '$lib/types/domain';
import type { Race, RaceCategory, RaceCategoryGender, RaceCategoryLength } from '$lib/types/domain';

// ============================================================================
// Response Types
// ============================================================================

/**
 * Event with races array and supported categories/genders/lengths.
 *
 * This aggregated type is returned by getEventWithRacesById() service
 * (via get_event_with_races_by_event_id RPC).
 *
 * Aggregation rationale:
 * - Fetches event + all races in single database round-trip
 * - Includes junction table data (supported categories/genders/lengths)
 * - Optimized for event detail pages that need complete event configuration
 *
 * Used by:
 * - /results/[id]/+page.server.ts (event detail page)
 */
export interface EventWithRaces extends Event {
	// Associated races
	races: Race[];

	// Supported configurations (from junction tables)
	supportedRaceCategories: RaceCategory[];
	supportedRaceCategoryGenders: RaceCategoryGender[];
	supportedRaceCategoryLengths: RaceCategoryLength[];
}

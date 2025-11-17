import type { Event } from '$lib/types/domain';
import type { Race, RaceCategory, RaceCategoryGender, RaceCategoryLength } from '$lib/types/domain';

/**
 * Service Response Types for Events
 *
 * These types represent structures returned by event service methods and RPC functions.
 * They are aggregated/nested structures optimized for specific use cases.
 */

/**
 * Event with races array and supported categories/genders/lengths.
 * Returned by getEventWithRacesById() service (via get_event_with_races_by_event_id RPC).
 * Used for event detail pages that need all event configuration and associated races.
 */
export interface EventWithRaces extends Event {
	// Associated races
	races: Race[];

	// Supported configurations (from junction tables)
	supportedRaceCategories: RaceCategory[];
	supportedRaceCategoryGenders: RaceCategoryGender[];
	supportedRaceCategoryLengths: RaceCategoryLength[];
}

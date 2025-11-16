import type { Tables } from '../database.types';
import type { RaceDB } from './races.db';

/**
 * Database type for events table.
 * Use this instead of Tables<'events'> throughout the codebase.
 */
export type EventDB = Tables<'events'>;

/**
 * Response type for event with races array and supported categories/genders/lengths.
 * Returned by get_event_with_races_by_event_id() RPC function.
 * Used by getEventWithRacesById() service.
 */
export interface EventWithRacesResponse extends EventDB {
	races: RaceDB[];
	supportedCategories: Array<{
		name: string;
		id: string;
	}>;
	supportedGenders: Array<{
		name: string;
		id: string;
	}>;
	supportedLengths: Array<{
		name: string;
		id: string;
	}>;
}

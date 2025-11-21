import type { Database, Tables } from '../database.types';
import type { RaceDB } from './races.db';

/**
 * Database type for events table.
 * Use this instead of Tables<'events'> throughout the codebase.
 */
export type EventDB = Tables<'events'>;

/**
 * Return type for get_events_by_organization RPC.
 * Auto-generated from database schema.
 */
export type GetEventsOrgRpcReturn =
	Database['public']['Functions']['get_events_by_organization']['Returns'][number];

/**
 * Return type for get_event_by_id RPC.
 * Auto-generated from database schema.
 */
export type GetEventByIdRpcReturn =
	Database['public']['Functions']['get_event_by_id']['Returns'][number];

/**
 * Return type for create_event RPC.
 * Auto-generated from database schema.
 */
export type CreateEventRpcReturn =
	Database['public']['Functions']['create_event']['Returns'][number];

/**
 * Return type for update_event RPC.
 * Auto-generated from database schema.
 */
export type UpdateEventRpcReturn =
	Database['public']['Functions']['update_event']['Returns'][number];

/**
 * Response type for event with races array and supported categories/genders/lengths.
 * Returned by get_event_with_races_by_event_id() RPC function.
 * Used by getEventWithRacesById() service.
 * Uses snake_case to match database/RPC output (transformed to camelCase in adapter).
 */
export interface EventWithRacesResponse extends EventDB {
	races: RaceDB[];
	supported_categories: Array<{
		name: string;
		id: string;
	}>;
	supported_genders: Array<{
		name: string;
		id: string;
	}>;
	supported_lengths: Array<{
		name: string;
		id: string;
	}>;
}

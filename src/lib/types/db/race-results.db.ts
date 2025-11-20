import type { Database, Tables } from '../database.types';

/**
 * Database type for race_results table.
 * Use this for direct table operations.
 */
export type RaceResultTableDB = Tables<'race_results'>;

/**
 * Auto-generated type for race result RPC response.
 * Returned by get_race_results_by_user_id() RPC function.
 * Includes flattened event, race, and category data (snake_case from DB).
 */
export type RaceResultDB =
	Database['public']['Functions']['get_race_results_by_user_id']['Returns'][number];

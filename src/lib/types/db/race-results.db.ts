import type { Tables } from '../database.types';

/**
 * Database type for race_results table.
 * Use this instead of Tables<'race_results'> throughout the codebase.
 */
export type RaceResultDB = Tables<'race_results'>;

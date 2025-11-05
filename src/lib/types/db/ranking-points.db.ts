import type { Tables } from '../database.types';

/**
 * Database type for ranking_points table.
 * Use this instead of Tables<'ranking_points'> throughout the codebase.
 */
export type RankingPointDB = Tables<'ranking_points'>;

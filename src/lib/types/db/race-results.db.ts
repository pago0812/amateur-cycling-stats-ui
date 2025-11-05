import type { Tables } from '../database.types';
import type { CyclistDB } from './cyclists.db';
import type { RankingPointDB } from './ranking-points.db';

/**
 * Database type for race_results table.
 * Use this instead of Tables<'race_results'> throughout the codebase.
 */
export type RaceResultDB = Tables<'race_results'>;

/**
 * Response type for race result with nested cyclist and ranking point.
 * Used by getRaceResultsByRaceId() service.
 * Note: 'points' is a computed field derived from ranking_points.points
 */
export interface RaceResultWithRelationsResponse extends RaceResultDB {
	points: number | null;
	cyclists: CyclistDB;
	ranking_points: RankingPointDB | null;
}

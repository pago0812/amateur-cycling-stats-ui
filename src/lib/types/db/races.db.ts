import type { Tables } from '../database.types';
import type { RaceResultDB } from './race-results.db';
import type { CyclistDB } from './cyclists.db';
import type { RankingPointDB } from './ranking-points.db';

/**
 * Database type for races table.
 * Use this instead of Tables<'races'> throughout the codebase.
 */
export type RaceDB = Tables<'races'>;

/**
 * Response type for race with nested race results, cyclists, and ranking points.
 * Used by getRaceWithResultsWithFilters() service.
 */
export interface RaceWithResultsResponse extends RaceDB {
	race_results: Array<
		RaceResultDB & {
			points: number | null;
			cyclists: CyclistDB;
			ranking_points: RankingPointDB | null;
		}
	>;
}

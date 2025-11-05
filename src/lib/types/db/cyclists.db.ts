import type { Tables } from '../database.types';
import type { CyclistGenderDB, RaceCategoryDB, RaceCategoryGenderDB, RaceCategoryLengthDB, RaceRankingDB } from './lookup-tables.db';
import type { RaceResultDB } from './race-results.db';
import type { RaceDB } from './races.db';
import type { EventDB } from './events.db';
import type { RankingPointDB } from './ranking-points.db';

/**
 * Database type for cyclists table.
 * Use this instead of Tables<'cyclists'> throughout the codebase.
 */
export type CyclistDB = Tables<'cyclists'>;

/**
 * Response type for cyclist with race results and full race details.
 * Used by getCyclistWithResultsById() service.
 */
export interface CyclistWithResultsResponse extends CyclistDB {
	gender: CyclistGenderDB | null;
	race_results: Array<
		RaceResultDB & {
			points: number | null;
			race: RaceDB & {
				event: EventDB;
				race_category: RaceCategoryDB;
				race_category_gender: RaceCategoryGenderDB;
				race_category_length: RaceCategoryLengthDB;
				race_ranking: RaceRankingDB;
			};
			ranking_point: RankingPointDB | null;
		}
	>;
}

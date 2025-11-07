import type { Tables } from '../database.types';
import type {
	CyclistGenderDB,
	RaceCategoryDB,
	RaceCategoryGenderDB,
	RaceCategoryLengthDB,
	RaceRankingDB
} from './lookup-tables.db';
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

/**
 * RPC response type for get_cyclist_with_results() function.
 * Returns JSONB with cyclist + nested race_results array.
 * Each result includes full race details and ranking points.
 */
export interface CyclistWithResultsRpcResponse {
	id: string;
	name: string;
	last_name: string;
	born_year: number | null;
	gender_id: string | null;
	user_id: string | null;
	created_at: string;
	updated_at: string;
	gender: CyclistGenderDB | null;
	race_results: Array<{
		id: string;
		place: number;
		time: string | null;
		cyclist_id: string;
		race_id: string;
		ranking_point_id: string | null;
		created_at: string;
		updated_at: string;
		race: {
			id: string;
			name: string | null;
			description: string | null;
			date_time: string;
			is_public_visible: boolean;
			event_id: string;
			race_category_id: string;
			race_category_gender_id: string;
			race_category_length_id: string;
			race_ranking_id: string;
			created_at: string;
			updated_at: string;
			event: EventDB;
			race_category: RaceCategoryDB;
			race_category_gender: RaceCategoryGenderDB;
			race_category_length: RaceCategoryLengthDB;
			race_ranking: RaceRankingDB;
		};
		ranking_point: RankingPointDB | null;
	}>;
}

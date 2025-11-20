import type { Tables } from '../database.types';
import type { RaceResultTableDB } from './race-results.db';
import type { CyclistDB } from './cyclists.db';
import type { UserDB } from './users.db';
import type { RankingPointDB } from './ranking-points.db';

/**
 * Database type for races table.
 * Use this instead of Tables<'races'> throughout the codebase.
 */
export type RaceDB = Tables<'races'>;

/**
 * Response type for race with nested race results, cyclists (with users for names), and ranking points.
 * Used by getRaceWithResultsWithFilters() service.
 */
export interface RaceWithResultsResponse extends RaceDB {
	race_results: Array<
		RaceResultTableDB & {
			points: number | null;
			cyclists: CyclistDB & {
				users: UserDB | null;
			};
			ranking_points: RankingPointDB | null;
		}
	>;
}

/**
 * RPC response type for get_race_with_results_by_id.
 * JSONB structure returned by the RPC function (snake_case).
 */
export interface RpcRaceWithResultsResponse {
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
	race_results: Array<{
		id: string;
		place: number;
		time: string | null;
		points: number | null;
		user_id: string;
		cyclist_first_name: string;
		cyclist_last_name: string;
		created_at: string;
		updated_at: string;
		ranking_point?: {
			id: string;
			place: number;
			points: number;
			race_ranking_id: string;
		} | null;
	}>;
}

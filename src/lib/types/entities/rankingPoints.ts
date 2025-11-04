import type { Tables } from '$lib/types/database.types';
import type { RaceRanking } from '$lib/types/collections/race-ranking';

// Base ranking point type from Supabase
export type RankingPoint = Tables<'ranking_points'>;

// Extended ranking point type with populated relationships
export interface RankingPointWithRelations extends RankingPoint {
	raceRanking?: RaceRanking;
}

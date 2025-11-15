import type { RaceResult, RaceResultWithRelations } from '$lib/types/domain/race-result.domain';
import type { RaceResultDB, RaceResultWithRelationsResponse, RaceResultRpcItem } from '$lib/types/db';
import { mapTimestamps } from './common.adapter';
import { adaptRankingPointFromDb } from './ranking-points.adapter';
import { adaptRaceFromDb } from './races.adapter';
import { adaptEventFromDb } from './events.adapter';
import { adaptRaceCategoryFromDb, adaptRaceCategoryGenderFromDb, adaptRaceCategoryLengthFromDb } from './race-categories.adapter';
import { adaptRaceRankingFromDb } from './race-rankings.adapter';

/**
 * Adapts a raw database race result row to domain RaceResult type.
 * Transforms snake_case → camelCase.
 */
export function adaptRaceResultFromDb(dbResult: RaceResultDB): RaceResult {
	return {
		id: dbResult.short_id, // Translate: short_id → id
		place: dbResult.place,
		time: dbResult.time,
		points: null, // Not in base table
		raceId: dbResult.race_id,
		cyclistId: dbResult.cyclist_id,
		rankingPointId: dbResult.ranking_point_id,
		...mapTimestamps(dbResult)
	};
}

/**
 * Adapts race result with populated ranking point.
 * Handles Supabase response from getRaceResultsByRaceId().
 */
export function adaptRaceResultWithRelationsFromDb(
	dbData: RaceResultWithRelationsResponse
): RaceResultWithRelations {
	return {
		id: dbData.short_id, // Translate: short_id → id
		place: dbData.place,
		time: dbData.time,
		points: dbData.points,
		raceId: dbData.race_id,
		cyclistId: dbData.cyclist_id,
		rankingPointId: dbData.ranking_point_id,
		...mapTimestamps(dbData),
		rankingPoint: dbData.ranking_points ? adaptRankingPointFromDb(dbData.ranking_points) : undefined
	};
}

/**
 * Adapts a single race result item from RPC response.
 * Used by get_race_results_by_user_short_id and get_cyclist_with_results RPCs.
 * Includes full race details with event, categories, and ranking info.
 */
export function adaptRaceResultFromRpc(rpcResult: RaceResultRpcItem): RaceResultWithRelations {
	return {
		id: rpcResult.short_id, // Translate: short_id → id
		place: rpcResult.place,
		time: rpcResult.time,
		points: rpcResult.ranking_point?.points ?? null, // Copy from ranking_point if available
		raceId: rpcResult.race_id,
		cyclistId: rpcResult.cyclist_id,
		rankingPointId: rpcResult.ranking_point_id,
		...mapTimestamps(rpcResult),
		race: {
			...adaptRaceFromDb(rpcResult.race),
			event: adaptEventFromDb(rpcResult.race.event),
			raceCategory: adaptRaceCategoryFromDb(rpcResult.race.race_category),
			raceCategoryGender: adaptRaceCategoryGenderFromDb(rpcResult.race.race_category_gender),
			raceCategoryLength: adaptRaceCategoryLengthFromDb(rpcResult.race.race_category_length),
			raceRanking: adaptRaceRankingFromDb(rpcResult.race.race_ranking)
		},
		rankingPoint: rpcResult.ranking_point ? adaptRankingPointFromDb(rpcResult.ranking_point) : undefined
	};
}

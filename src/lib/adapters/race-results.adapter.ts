import type { RaceResult, RaceResultWithRelations } from '$lib/types/domain/race-result.domain';
import type { RaceResultDB, RaceResultWithRelationsResponse } from '$lib/types/db';
import { mapTimestamps } from './common.adapter';
import { adaptCyclistFromDb } from './cyclists.adapter';
import { adaptRankingPointFromDb } from './ranking-points.adapter';

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
 * Adapts race result with populated cyclist and ranking point.
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
		cyclist: adaptCyclistFromDb(dbData.cyclists),
		rankingPoint: dbData.ranking_points ? adaptRankingPointFromDb(dbData.ranking_points) : undefined
	};
}

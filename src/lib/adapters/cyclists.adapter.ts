import type { Cyclist, CyclistWithRelations } from '$lib/types/domain/cyclist.domain';
import type {
	CyclistDB,
	CyclistWithResultsResponse,
	CyclistWithResultsRpcResponse
} from '$lib/types/db';
import { mapTimestamps } from './common.adapter';
import { adaptCyclistGenderFromDb } from './cyclist-genders.adapter';
import { adaptRaceRankingFromDb } from './race-rankings.adapter';
import { adaptEventFromDb } from './events.adapter';
import { adaptRaceFromDb } from './races.adapter';
import {
	adaptRaceCategoryFromDb,
	adaptRaceCategoryGenderFromDb,
	adaptRaceCategoryLengthFromDb
} from './race-categories.adapter';
import { adaptRankingPointFromDb } from './ranking-points.adapter';

/**
 * Adapts a raw database cyclist row to domain Cyclist type.
 * Transforms snake_case → camelCase and short_id → id (domain abstraction).
 */
export function adaptCyclistFromDb(
	dbCyclist: CyclistDB | CyclistWithResultsResponse['race_results'][0]['race']['event']
): Cyclist {
	return {
		id: dbCyclist.short_id, // Translate: short_id → id (UUID stays internal)
		name: dbCyclist.name,
		lastName: 'last_name' in dbCyclist ? dbCyclist.last_name : '',
		bornYear: 'born_year' in dbCyclist ? dbCyclist.born_year : null,
		genderId: 'gender_id' in dbCyclist ? dbCyclist.gender_id : null,
		userId: 'user_id' in dbCyclist ? dbCyclist.user_id : null,
		...mapTimestamps(dbCyclist)
	};
}

/**
 * Adapts cyclist with race results and full race details.
 * Handles complex nested Supabase response from getCyclistWithResultsById().
 */
export function adaptCyclistWithResultsFromDb(
	dbData: CyclistWithResultsResponse
): CyclistWithRelations {
	const baseCyclist = adaptCyclistFromDb(dbData);

	return {
		...baseCyclist,
		gender: dbData.gender ? adaptCyclistGenderFromDb(dbData.gender) : undefined,
		raceResults:
			dbData.race_results?.map((result) => ({
				id: result.id,
				place: result.place,
				time: result.time,
				points: result.points,
				raceId: result.race_id,
				cyclistId: result.cyclist_id,
				rankingPointId: result.ranking_point_id,
				...mapTimestamps(result),
				race: {
					...adaptRaceFromDb(result.race),
					event: adaptEventFromDb(result.race.event),
					raceCategory: adaptRaceCategoryFromDb(result.race.race_category),
					raceCategoryGender: adaptRaceCategoryGenderFromDb(result.race.race_category_gender),
					raceCategoryLength: adaptRaceCategoryLengthFromDb(result.race.race_category_length),
					raceRanking: adaptRaceRankingFromDb(result.race.race_ranking)
				},
				rankingPoint: result.ranking_point
					? adaptRankingPointFromDb(result.ranking_point)
					: undefined
			})) || []
	};
}

/**
 * Adapts RPC response from get_cyclist_with_results() to domain type.
 * Transforms snake_case → camelCase for nested race results.
 * Translates short_id → id for domain abstraction.
 */
export function adaptCyclistWithResultsFromRpc(
	rpcData: CyclistWithResultsRpcResponse
): CyclistWithRelations {
	return {
		id: rpcData.short_id, // Translate: short_id → id (UUID stays internal)
		name: rpcData.name,
		lastName: rpcData.last_name,
		bornYear: rpcData.born_year,
		genderId: rpcData.gender_id,
		userId: rpcData.user_id,
		createdAt: rpcData.created_at,
		updatedAt: rpcData.updated_at,
		gender: rpcData.gender ? adaptCyclistGenderFromDb(rpcData.gender) : undefined,
		raceResults: rpcData.race_results.map((result) => ({
			id: result.short_id, // Translate: short_id → id
			place: result.place,
			time: result.time,
			points: result.ranking_point?.points ?? null, // Copy from ranking_point if available
			raceId: result.race_id,
			cyclistId: result.cyclist_id,
			rankingPointId: result.ranking_point_id,
			...mapTimestamps(result),
			race: {
				...adaptRaceFromDb(result.race),
				event: adaptEventFromDb(result.race.event),
				raceCategory: adaptRaceCategoryFromDb(result.race.race_category),
				raceCategoryGender: adaptRaceCategoryGenderFromDb(result.race.race_category_gender),
				raceCategoryLength: adaptRaceCategoryLengthFromDb(result.race.race_category_length),
				raceRanking: adaptRaceRankingFromDb(result.race.race_ranking)
			},
			rankingPoint: result.ranking_point ? adaptRankingPointFromDb(result.ranking_point) : undefined
		}))
	};
}

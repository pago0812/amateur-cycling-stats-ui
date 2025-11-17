import type { Race, RaceWithRelations } from '$lib/types/domain';
import type { RaceDetailResult, RaceWithRaceResults } from '$lib/types/services';
import type { RaceDB, RaceWithResultsResponse, RpcRaceWithResultsResponse } from '$lib/types/db';
import { mapTimestamps } from './common.adapter';
import { adaptRaceResultFromNested } from './race-results.adapter';

/**
 * Adapts a raw database race row to domain Race type.
 * Transforms snake_case → camelCase.
 */
export function adaptRaceFromDb(dbRace: RaceDB): Race {
	return {
		id: dbRace.id,
		name: dbRace.name,
		description: dbRace.description,
		dateTime: dbRace.date_time,
		isPublicVisible: dbRace.is_public_visible,
		eventId: dbRace.event_id,
		raceCategoryId: dbRace.race_category_id,
		raceCategoryGenderId: dbRace.race_category_gender_id,
		raceCategoryLengthId: dbRace.race_category_length_id,
		raceRankingId: dbRace.race_ranking_id,
		...mapTimestamps(dbRace)
	};
}

/**
 * Adapts race with nested results, cyclists, and ranking points.
 * Handles complex Supabase response from getRaceWithResultsWithFilters().
 * Returns race with raceResults array.
 */
export function adaptRaceWithResultsFromDb(
	dbData: RaceWithResultsResponse
): RaceWithRelations & { raceResults: RaceDetailResult[] } {
	const baseRace = adaptRaceFromDb(dbData);

	return {
		...baseRace,
		raceResults: dbData.race_results?.map(adaptRaceResultFromNested) || []
	};
}

/**
 * Adapts race with race results from RPC JSONB response.
 * Handles JSONB response from get_race_with_results_by_id RPC.
 * Transforms snake_case → camelCase.
 */
export function adaptRaceWithRaceResultsFromRpc(
	rpcData: RpcRaceWithResultsResponse
): RaceWithRaceResults {
	return {
		// Race fields
		id: rpcData.id,
		name: rpcData.name,
		description: rpcData.description,
		dateTime: rpcData.date_time,
		isPublicVisible: rpcData.is_public_visible,
		eventId: rpcData.event_id,
		raceCategoryId: rpcData.race_category_id,
		raceCategoryGenderId: rpcData.race_category_gender_id,
		raceCategoryLengthId: rpcData.race_category_length_id,
		raceRankingId: rpcData.race_ranking_id,
		createdAt: rpcData.created_at,
		updatedAt: rpcData.updated_at,
		// Race results
		raceResults: rpcData.race_results.map((result) => ({
			id: result.id,
			place: result.place,
			time: result.time,
			points: result.points,
			cyclistId: result.user_id,
			cyclistFirstName: result.cyclist_first_name,
			cyclistLastName: result.cyclist_last_name,
			createdAt: result.created_at,
			updatedAt: result.updated_at,
			rankingPoint: result.ranking_point
				? {
						id: result.ranking_point.id,
						place: result.ranking_point.place,
						points: result.ranking_point.points,
						raceRankingId: result.ranking_point.race_ranking_id
					}
				: undefined
		}))
	};
}

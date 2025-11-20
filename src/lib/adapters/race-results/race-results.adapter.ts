import type { RaceResult } from '$lib/types/domain/race-result.domain';
import type { RaceDetailResult } from '$lib/types/services';
import type { RaceResultDB, RaceWithResultsResponse } from '$lib/types/db';
import { mapTimestamps } from '../common/common.adapter';
import { adaptRankingPointFromDb } from '../ranking-points/ranking-points.adapter';

/**
 * Adapts a single race result item from RPC response with flat structure.
 * Used by get_race_results_by_user_id RPC.
 * Simple snake_case → camelCase transformation.
 */
export function adaptRaceResultFromRpc(rpcResult: RaceResultDB): RaceResult {
	return {
		// Race result fields
		id: rpcResult.id,
		place: rpcResult.place,
		time: rpcResult.time,
		points: rpcResult.points,
		createdAt: rpcResult.created_at,
		updatedAt: rpcResult.updated_at,

		// Event fields
		eventId: rpcResult.event_id,
		eventName: rpcResult.event_name,
		eventDateTime: rpcResult.event_date_time,
		eventYear: rpcResult.event_year,
		eventCity: rpcResult.event_city,
		eventState: rpcResult.event_state,
		eventCountry: rpcResult.event_country,
		eventStatus: rpcResult.event_status,

		// Race fields
		raceId: rpcResult.race_id,
		raceName: rpcResult.race_name,
		raceDateTime: rpcResult.race_date_time,

		// Category IDs
		raceCategoryId: rpcResult.race_category_id,
		raceCategoryGenderId: rpcResult.race_category_gender_id,
		raceCategoryLengthId: rpcResult.race_category_length_id,

		// Category types
		raceCategoryType: rpcResult.race_category_type,
		raceCategoryGenderType: rpcResult.race_category_gender_type,
		raceCategoryLengthType: rpcResult.race_category_length_type,
		raceRankingType: rpcResult.race_ranking_type
	};
}

/**
 * Adapts array of race results from RPC response.
 * Maps auto-typed RETURNS TABLE response to domain types.
 * Used by get_race_results_by_user_id RPC.
 */
export function adaptRaceResultsFromRpc(rpcResult: RaceResultDB[]): RaceResult[] {
	const results = rpcResult || [];
	return results.map(adaptRaceResultFromRpc);
}

/**
 * Adapts race result from nested response (used within race queries).
 * Returns partial result data (only essential fields for race detail view).
 * Maps cyclist.id to cyclistId (domain layer uses cyclist.id as identifier).
 */
export function adaptRaceResultFromNested(
	dbResult: RaceWithResultsResponse['race_results'][0]
): RaceDetailResult {
	return {
		id: dbResult.id,
		place: dbResult.place,
		time: dbResult.time,
		points: dbResult.points,
		cyclistId: dbResult.cyclists.id,
		cyclistFirstName: dbResult.cyclists.users?.first_name ?? '',
		cyclistLastName: dbResult.cyclists.users?.last_name ?? '',
		...mapTimestamps(dbResult),
		rankingPoint: dbResult.ranking_points
			? adaptRankingPointFromDb(dbResult.ranking_points)
			: undefined
	};
}

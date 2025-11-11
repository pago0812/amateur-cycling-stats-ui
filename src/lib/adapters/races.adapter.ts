import type { Race, RaceWithRelations } from '$lib/types/domain/race.domain';
import type { RaceResult, RaceResultWithRelations } from '$lib/types/domain/race-result.domain';
import type { RaceDB, RaceWithResultsResponse } from '$lib/types/db';
import { mapTimestamps } from './common.adapter';
import { adaptCyclistFromDb } from './cyclists.adapter';
import { adaptRankingPointFromDb } from './ranking-points.adapter';

/**
 * Adapts a raw database race row to domain Race type.
 * Transforms snake_case → camelCase.
 */
export function adaptRaceFromDb(dbRace: RaceDB): Race {
	return {
		id: dbRace.short_id, // Translate: short_id → id
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
 * Adapts race result from nested response (used within race queries).
 * Now includes user data for cyclist names.
 */
function adaptRaceResultFromNested(
	dbResult: RaceWithResultsResponse['race_results'][0]
): RaceResultWithRelations {
	const baseResult: RaceResult = {
		id: dbResult.short_id, // Translate: short_id → id
		place: dbResult.place,
		time: dbResult.time,
		points: dbResult.points,
		raceId: dbResult.race_id,
		cyclistId: dbResult.cyclist_id,
		rankingPointId: dbResult.ranking_point_id,
		...mapTimestamps(dbResult)
	};

	// Create cyclist with user data for names
	const cyclist = {
		...adaptCyclistFromDb(dbResult.cyclists),
		user: dbResult.cyclists.users
			? {
					id: dbResult.cyclists.users.short_id,
					firstName: dbResult.cyclists.users.first_name,
					lastName: dbResult.cyclists.users.last_name,
					roleId: dbResult.cyclists.users.role_id || '',
					createdAt: dbResult.cyclists.users.created_at || '',
					updatedAt: dbResult.cyclists.users.updated_at || ''
				}
			: undefined
	};

	return {
		...baseResult,
		cyclist,
		rankingPoint: dbResult.ranking_points
			? adaptRankingPointFromDb(dbResult.ranking_points)
			: undefined
	};
}

/**
 * Adapts race with nested results, cyclists, and ranking points.
 * Handles complex Supabase response from getRaceWithResultsWithFilters().
 */
export function adaptRaceWithResultsFromDb(dbData: RaceWithResultsResponse): RaceWithRelations {
	const baseRace = adaptRaceFromDb(dbData);

	return {
		...baseRace,
		raceResults: dbData.race_results?.map(adaptRaceResultFromNested) || []
	};
}

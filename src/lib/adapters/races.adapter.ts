import type { Race, RaceWithRelations, RaceDetailResult } from '$lib/types/domain';
import type { RaceDB, RaceWithResultsResponse } from '$lib/types/db';
import { mapTimestamps } from './common.adapter';
import { adaptRaceResultFromNested } from './race-results.adapter';

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

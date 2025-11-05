import type { Cyclist, CyclistWithRelations } from '$lib/types/domain/cyclist.domain';
import type { CyclistDB, CyclistWithResultsResponse } from '$lib/types/db';
import { mapTimestamps } from './common.adapter';

/**
 * Adapts a raw database cyclist row to domain Cyclist type.
 * Transforms snake_case → camelCase.
 */
export function adaptCyclistFromDb(
	dbCyclist: CyclistDB | CyclistWithResultsResponse['race_results'][0]['race']['event']
): Cyclist {
	return {
		id: dbCyclist.id,
		name: dbCyclist.name,
		lastName: 'last_name' in dbCyclist ? dbCyclist.last_name : '',
		bornYear: 'born_year' in dbCyclist ? dbCyclist.born_year : null,
		genderId: 'gender_id' in dbCyclist ? dbCyclist.gender_id : null,
		userId: 'user_id' in dbCyclist ? dbCyclist.user_id : null,
		createdAt: dbCyclist.created_at,
		updatedAt: dbCyclist.updated_at
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
		gender: dbData.gender
			? {
					id: dbData.gender.id,
					name: dbData.gender.name,
					...mapTimestamps(dbData.gender)
				}
			: undefined,
		raceResults: dbData.race_results?.map((result) => ({
			id: result.id,
			place: result.place,
			time: result.time,
			points: result.points,
			raceId: result.race_id,
			cyclistId: result.cyclist_id,
			rankingPointId: result.ranking_point_id,
			...mapTimestamps(result),
			race: {
				id: result.race.id,
				name: result.race.name,
				description: result.race.description,
				dateTime: result.race.date_time,
				isPublicVisible: result.race.is_public_visible,
				eventId: result.race.event_id,
				raceCategoryId: result.race.race_category_id,
				raceCategoryGenderId: result.race.race_category_gender_id,
				raceCategoryLengthId: result.race.race_category_length_id,
				raceRankingId: result.race.race_ranking_id,
				...mapTimestamps(result.race),
				event: {
					id: result.race.event.id,
					name: result.race.event.name,
					description: result.race.event.description,
					dateTime: result.race.event.date_time,
					year: result.race.event.year,
					city: result.race.event.city,
					state: result.race.event.state,
					country: result.race.event.country,
					eventStatus: result.race.event.event_status as 'DRAFT' | 'AVAILABLE' | 'SOLD_OUT' | 'ON_GOING' | 'FINISHED',
					isPublicVisible: result.race.event.is_public_visible,
					organizationId: result.race.event.organization_id,
					createdBy: result.race.event.created_by,
					...mapTimestamps(result.race.event)
				},
				raceCategory: {
					id: result.race.race_category.id,
					name: result.race.race_category.name,
					...mapTimestamps(result.race.race_category)
				},
				raceCategoryGender: {
					id: result.race.race_category_gender.id,
					name: result.race.race_category_gender.name,
					...mapTimestamps(result.race.race_category_gender)
				},
				raceCategoryLength: {
					id: result.race.race_category_length.id,
					name: result.race.race_category_length.name,
					...mapTimestamps(result.race.race_category_length)
				},
				raceRanking: {
					id: result.race.race_ranking.id,
					name: result.race.race_ranking.name as 'UCI' | 'NATIONAL' | 'REGIONAL' | 'CUSTOM',
					description: result.race.race_ranking.description,
					...mapTimestamps(result.race.race_ranking)
				}
			},
			rankingPoint: result.ranking_point
				? {
						id: result.ranking_point.id,
						place: result.ranking_point.place,
						points: result.ranking_point.points,
						raceRankingId: result.ranking_point.race_ranking_id,
						...mapTimestamps(result.ranking_point)
					}
				: undefined
		})) || []
	};
}

import type { Event } from '$lib/types/domain/event.domain';
import type { EventWithRaces } from '$lib/types/services';
import type { EventDB, EventWithRacesResponse } from '$lib/types/db';
import { mapTimestamps } from './common.adapter';
import { adaptRaceFromDb } from './races.adapter';
import {
	adaptRaceCategoryFromRpc,
	adaptRaceCategoryGenderFromRpc,
	adaptRaceCategoryLengthFromRpc
} from './race-categories.adapter';

/**
 * Adapts a raw database event row to domain Event type.
 * Transforms snake_case → camelCase.
 */
export function adaptEventFromDb(dbEvent: EventDB): Event {
	return {
		id: dbEvent.id,
		name: dbEvent.name,
		description: dbEvent.description,
		dateTime: dbEvent.date_time,
		year: dbEvent.year,
		city: dbEvent.city,
		state: dbEvent.state,
		country: dbEvent.country,
		eventStatus: dbEvent.event_status as Event['eventStatus'],
		isPublicVisible: dbEvent.is_public_visible,
		organizationId: dbEvent.organization_id,
		createdBy: dbEvent.created_by,
		...mapTimestamps(dbEvent)
	};
}

/**
 * Adapts event with races array and supported categories/genders/lengths.
 * Handles RPC response from get_event_with_races_by_event_id().
 * Transforms all snake_case → camelCase.
 */
export function adaptEventWithRacesFromDb(dbData: EventWithRacesResponse): EventWithRaces {
	const baseEvent = adaptEventFromDb(dbData);

	return {
		...baseEvent,
		races: dbData.races?.map(adaptRaceFromDb) || [],
		supportedRaceCategories: dbData.supported_categories?.map(adaptRaceCategoryFromRpc) || [],
		supportedRaceCategoryGenders:
			dbData.supported_genders?.map(adaptRaceCategoryGenderFromRpc) || [],
		supportedRaceCategoryLengths:
			dbData.supported_lengths?.map(adaptRaceCategoryLengthFromRpc) || []
	};
}

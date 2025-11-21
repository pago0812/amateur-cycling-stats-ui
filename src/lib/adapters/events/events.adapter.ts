import type { Event } from '$lib/types/domain/event.domain';
import type { EventWithRaces, EventWithRaceCount, PartialEvent } from '$lib/types/services';
import type {
	EventDB,
	EventWithRacesResponse,
	GetEventsOrgRpcReturn,
	GetEventByIdRpcReturn,
	CreateEventRpcReturn,
	UpdateEventRpcReturn
} from '$lib/types/db';
import { mapTimestamps } from '../common/common.adapter';
import { adaptRaceFromDb } from '../races/races.adapter';
import {
	adaptRaceCategoryFromRpc,
	adaptRaceCategoryGenderFromRpc,
	adaptRaceCategoryLengthFromRpc
} from '../race-categories/race-categories.adapter';

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
export function adaptEventWithRacesFromRpc(dbData: EventWithRacesResponse): EventWithRaces {
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

/**
 * Adapts get_events_by_organization RPC return to EventWithRaceCount.
 * Transforms snake_case → camelCase.
 */
export function adaptEventWithRaceCountFromRpc(row: GetEventsOrgRpcReturn): EventWithRaceCount {
	return {
		id: row.id,
		name: row.name,
		description: row.description,
		dateTime: row.date_time,
		year: row.year,
		city: row.city,
		state: row.state,
		country: row.country,
		eventStatus: row.event_status as Event['eventStatus'],
		isPublicVisible: row.is_public_visible,
		organizationId: row.organization_id,
		createdBy: row.created_by,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
		raceCount: row.race_count
	};
}

/**
 * Adapts get_event_by_id or create_event or update_event RPC return to Event.
 * These RPCs return the same structure.
 */
export function adaptEventFromRpc(
	row: GetEventByIdRpcReturn | CreateEventRpcReturn | UpdateEventRpcReturn
): Event {
	return {
		id: row.id,
		name: row.name,
		description: row.description,
		dateTime: row.date_time,
		year: row.year,
		city: row.city,
		state: row.state,
		country: row.country,
		eventStatus: row.event_status as Event['eventStatus'],
		isPublicVisible: row.is_public_visible,
		organizationId: row.organization_id,
		createdBy: row.created_by,
		createdAt: row.created_at,
		updatedAt: row.updated_at
	};
}

/**
 * Reverse adapter: Domain PartialEvent → Database JSONB format.
 * Used by updateEvent service function.
 */
export function adaptEventFromDomain(
	partial: PartialEvent
): Record<string, string | boolean | null> {
	const dbData: Record<string, string | boolean | null> = {};
	if (partial.name !== undefined) dbData.name = partial.name;
	if (partial.description !== undefined) dbData.description = partial.description;
	if (partial.dateTime !== undefined) dbData.date_time = partial.dateTime;
	if (partial.country !== undefined) dbData.country = partial.country;
	if (partial.state !== undefined) dbData.state = partial.state;
	if (partial.city !== undefined) dbData.city = partial.city;
	if (partial.eventStatus !== undefined) dbData.event_status = partial.eventStatus;
	if (partial.isPublicVisible !== undefined) dbData.is_public_visible = partial.isPublicVisible;
	return dbData;
}

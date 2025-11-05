import type { Event, EventWithRelations } from '$lib/types/domain/event.domain';
import type { RaceCategory, RaceCategoryGender, RaceCategoryLength } from '$lib/types/domain/race-category.domain';
import type { EventDB, EventWithCategoriesResponse } from '$lib/types/db';
import { mapTimestamps } from './common.adapter';

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
 * Adapts race category from junction table response.
 */
function adaptRaceCategoryFromJunction(junctionData: {
	race_categories: {
		id: string;
		name: string;
		created_at: string;
		updated_at: string;
	};
}): RaceCategory {
	return {
		id: junctionData.race_categories.id,
		name: junctionData.race_categories.name,
		createdAt: junctionData.race_categories.created_at,
		updatedAt: junctionData.race_categories.updated_at
	};
}

/**
 * Adapts race category gender from junction table response.
 */
function adaptRaceCategoryGenderFromJunction(junctionData: {
	race_category_genders: {
		id: string;
		name: string;
		created_at: string;
		updated_at: string;
	};
}): RaceCategoryGender {
	return {
		id: junctionData.race_category_genders.id,
		name: junctionData.race_category_genders.name,
		createdAt: junctionData.race_category_genders.created_at,
		updatedAt: junctionData.race_category_genders.updated_at
	};
}

/**
 * Adapts race category length from junction table response.
 */
function adaptRaceCategoryLengthFromJunction(junctionData: {
	race_category_lengths: {
		id: string;
		name: string;
		created_at: string;
		updated_at: string;
	};
}): RaceCategoryLength {
	return {
		id: junctionData.race_category_lengths.id,
		name: junctionData.race_category_lengths.name,
		createdAt: junctionData.race_category_lengths.created_at,
		updatedAt: junctionData.race_category_lengths.updated_at
	};
}

/**
 * Adapts event with junction table data to EventWithRelations.
 * Handles complex Supabase response with nested junction tables.
 */
export function adaptEventWithRelationsFromDb(
	dbData: EventWithCategoriesResponse
): EventWithRelations {
	const baseEvent = adaptEventFromDb(dbData);

	return {
		...baseEvent,
		supportedRaceCategories: dbData.supportedCategories?.map(adaptRaceCategoryFromJunction) || [],
		supportedRaceCategoryGenders: dbData.supportedGenders?.map(adaptRaceCategoryGenderFromJunction) || [],
		supportedRaceCategoryLengths: dbData.supportedLengths?.map(adaptRaceCategoryLengthFromJunction) || []
	};
}

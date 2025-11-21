import type { Event } from '../domain/event.domain';

/**
 * Request type for creating a new event.
 * Used by createEvent service function.
 */
export interface CreateEventRequest {
	name: string;
	description: string | null;
	dateTime: string; // ISO 8601
	country: string;
	state: string;
	city: string | null;
	isPublicVisible: boolean;
	categoryIds: string[]; // UUID[]
	genderIds: string[]; // UUID[]
	lengthIds: string[]; // UUID[]
}

/**
 * Partial update type for events.
 * Used by updateEvent service function.
 * Only includes updateable fields.
 */
export type PartialEvent = Partial<
	Pick<
		Event,
		| 'name'
		| 'description'
		| 'dateTime'
		| 'country'
		| 'state'
		| 'city'
		| 'eventStatus'
		| 'isPublicVisible'
	>
>;

/**
 * Parameters for getting events by organization.
 */
export interface GetEventsByOrganizationParams {
	organizationId: string;
	filter?: 'all' | 'future' | 'past';
}

/**
 * Event with race count for list display.
 * Extends Event with additional aggregation.
 */
export interface EventWithRaceCount extends Event {
	raceCount: number;
}

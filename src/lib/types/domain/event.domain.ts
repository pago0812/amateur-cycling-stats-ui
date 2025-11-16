import type { RaceCategory } from './race-category.domain';
import type { RaceCategoryGender } from './race-category.domain';
import type { RaceCategoryLength } from './race-category.domain';
import type { Race } from './race.domain';

/**
 * Event status enum
 */
export type EventStatus = 'DRAFT' | 'AVAILABLE' | 'SOLD_OUT' | 'ON_GOING' | 'FINISHED';

/**
 * Event domain type - cycling event entity.
 * All fields use camelCase convention.
 * Used throughout the application by components and services.
 */
export interface Event {
	// Identity
	id: string;

	// Basic Info
	name: string;
	description: string | null;

	// Date & Location
	dateTime: string; // ISO 8601 timestamp
	year: number; // Extracted year for filtering
	city: string | null;
	state: string;
	country: string;

	// Status & Visibility
	eventStatus: EventStatus;
	isPublicVisible: boolean;

	// Relationships (Foreign Keys)
	organizationId: string | null;
	createdBy: string | null; // User ID who created

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

/**
 * Event with races array and supported categories/genders/lengths.
 * Returned by getEventWithRacesById() service (via RPC).
 * Used for event detail pages that need all event configuration and associated races.
 */
export interface EventWithRaces extends Event {
	// Associated races
	races: Race[];

	// Supported configurations (from junction tables)
	supportedRaceCategories: RaceCategory[];
	supportedRaceCategoryGenders: RaceCategoryGender[];
	supportedRaceCategoryLengths: RaceCategoryLength[];
}

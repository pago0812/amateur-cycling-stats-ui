import type { Organization } from './organization.domain';
import type { User } from './user.domain';
import type { Race } from './race.domain';
import type { RaceCategory } from './race-category.domain';
import type { RaceCategoryGender } from './race-category.domain';
import type { RaceCategoryLength } from './race-category.domain';

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
 * Event with populated relationships.
 * Used when fetching detailed event data with joins.
 */
export interface EventWithRelations extends Event {
	// Populated relationships
	organization?: Organization;
	createdByUser?: User; // Renamed from createdBy for clarity
	races?: Race[];

	// Supported configurations (from junction tables)
	supportedRaceCategories?: RaceCategory[];
	supportedRaceCategoryGenders?: RaceCategoryGender[];
	supportedRaceCategoryLengths?: RaceCategoryLength[];
}

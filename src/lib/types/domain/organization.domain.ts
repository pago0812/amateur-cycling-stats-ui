import type { Event } from './event.domain';
import type { Organizer } from './organizer.domain';

/**
 * Organization state enum values
 */
export type OrganizationState = 'WAITING_OWNER' | 'ACTIVE' | 'DISABLED';

/**
 * Organization domain type - company/club that organizes cycling events.
 * All fields use camelCase convention.
 */
export interface Organization {
	// Identity
	id: string;

	// Basic Info
	name: string;
	description: string | null;

	// Status
	state: OrganizationState;

	// Aggregated data (optional, for list views)
	eventCount?: number;

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

/**
 * Organization with populated relationships.
 * Used when fetching organization with events and organizers.
 */
export interface OrganizationWithRelations extends Organization {
	// Populated relationships
	events?: Event[];
	organizers?: Organizer[];
}

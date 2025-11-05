import type { Event } from './event.domain';
import type { Organizer } from './organizer.domain';

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

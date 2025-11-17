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

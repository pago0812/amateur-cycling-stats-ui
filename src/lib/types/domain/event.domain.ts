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

	// Status
	eventStatus: EventStatus;

	// Relationships (Foreign Keys)
	organizationId: string | null;
	createdBy: string | null; // User ID who created

	// Flags
	isPublicVisible: boolean;

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

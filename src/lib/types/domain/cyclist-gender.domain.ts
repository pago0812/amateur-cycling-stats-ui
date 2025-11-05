/**
 * Cyclist gender domain type - gender for cyclists.
 * All fields use camelCase convention.
 */
export interface CyclistGender {
	// Identity
	id: string;

	// Basic Info
	name: string; // e.g., "M", "F"

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

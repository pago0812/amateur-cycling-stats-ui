/**
 * Race category domain type - age/experience categories.
 * All fields use camelCase convention.
 */
export interface RaceCategory {
	// Identity
	id: string;

	// Basic Info
	name: string; // e.g., "ELITE", "MA", "ES_19_23", etc.

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

/**
 * Race category gender domain type - gender categories.
 * All fields use camelCase convention.
 */
export interface RaceCategoryGender {
	// Identity
	id: string;

	// Basic Info
	name: string; // e.g., "MALE", "FEMALE", "OPEN"

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

/**
 * Race category length domain type - distance types.
 * All fields use camelCase convention.
 */
export interface RaceCategoryLength {
	// Identity
	id: string;

	// Basic Info
	name: string; // e.g., "LONG", "SHORT", "SPRINT", "UNIQUE"

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

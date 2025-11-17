/**
 * Race result domain type with flat structure.
 * All fields use camelCase convention.
 * Includes flattened event, race, and category data for optimal performance.
 * Used for cyclist profile pages where full context is needed.
 */
export interface RaceResult {
	// Identity
	id: string; // Race result UUID

	// Core result data
	place: number; // Final position
	time: string | null; // Finish time (HH:MM:SS format or null)
	points: number | null; // Points earned (may be null if not applicable)

	// Foreign Keys - Event
	eventId: string; // Event UUID

	// Foreign Keys - Race
	raceId: string; // Race UUID

	// Foreign Keys - Categories
	raceCategoryId: string; // Category UUID
	raceCategoryGenderId: string; // Gender UUID
	raceCategoryLengthId: string; // Length UUID

	// Flattened Event Data (for display)
	eventName: string;
	eventDateTime: string;
	eventYear: number;
	eventCity: string;
	eventState: string;
	eventCountry: string;
	eventStatus: string; // DRAFT | AVAILABLE | SOLD_OUT | ON_GOING | FINISHED

	// Flattened Race Data (for display)
	raceName: string | null;
	raceDateTime: string;

	// Flattened Category Data (enum values for display)
	raceCategoryType: string; // ELITE | MASTER_30 | MASTER_40 | etc.
	raceCategoryGenderType: string; // FEMALE | MALE | OPEN
	raceCategoryLengthType: string; // LONG | SHORT | SPRINT | UNIQUE
	raceRankingType: string; // UCI | NATIONAL | REGIONAL | CUSTOM

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

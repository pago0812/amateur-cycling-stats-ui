/**
 * Race result domain type with flat structure.
 * All fields use camelCase convention.
 * Includes flattened event, race, and category data for optimal performance.
 * Used for cyclist profile pages where full context is needed.
 */
export interface RaceResult {
	// Race result fields
	id: string; // Race result short_id (NanoID)
	place: number; // Final position
	time: string | null; // Finish time (HH:MM:SS format or null)
	points: number | null; // Points earned (may be null if not applicable)
	createdAt: string;
	updatedAt: string;

	// Event fields
	eventId: string; // Event short_id (NanoID)
	eventName: string;
	eventDateTime: string;
	eventYear: number;
	eventCity: string;
	eventState: string;
	eventCountry: string;
	eventStatus: string; // DRAFT | AVAILABLE | SOLD_OUT | ON_GOING | FINISHED

	// Race fields
	raceId: string; // Race short_id (NanoID)
	raceName: string | null;
	raceDateTime: string;

	// Category IDs (for interim navigation)
	raceCategoryId: string; // Category short_id (NanoID)
	raceCategoryGenderId: string; // Gender short_id (NanoID)
	raceCategoryLengthId: string; // Length short_id (NanoID)

	// Category types (enum values)
	raceCategoryType: string; // ELITE | MASTER_30 | MASTER_40 | etc.
	raceCategoryGenderType: string; // FEMALE | MALE | OPEN
	raceCategoryLengthType: string; // LONG | SHORT | SPRINT | UNIQUE
	raceRankingType: string; // UCI | NATIONAL | REGIONAL | CUSTOM
}

/**
 * Race detail result type - used for displaying results on race detail pages.
 * Partial result data (only essential fields) since event/race context is already known.
 * Includes cyclistId for linking to cyclist profiles.
 */
export interface RaceDetailResult {
	id: string;
	place: number;
	time: string | null;
	points: number | null;
	cyclistId: string;
	createdAt: string;
	updatedAt: string;
	rankingPoint?: {
		id: string;
		place: number;
		points: number;
		raceRankingId: string;
	};
}

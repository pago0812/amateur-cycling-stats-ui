import type { Event } from './event.domain';
import type { RaceResult, RaceResultWithRelations } from './race-result.domain';
import type { RaceCategory } from './race-category.domain';
import type { RaceCategoryGender } from './race-category.domain';
import type { RaceCategoryLength } from './race-category.domain';
import type { RaceRanking } from './race-ranking.domain';

/**
 * Race domain type - individual race within an event.
 * All fields use camelCase convention.
 */
export interface Race {
	// Identity
	id: string;

	// Basic Info
	name: string | null;
	description: string | null;
	dateTime: string; // ISO 8601 timestamp

	// Visibility
	isPublicVisible: boolean;

	// Relationships (Foreign Keys)
	eventId: string;
	raceCategoryId: string;
	raceCategoryGenderId: string;
	raceCategoryLengthId: string;
	raceRankingId: string;

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

/**
 * Race with populated relationships.
 * Used when fetching race data with event, results, and category info.
 */
export interface RaceWithRelations extends Race {
	// Populated relationships
	event?: Event;
	raceCategory?: RaceCategory;
	raceCategoryGender?: RaceCategoryGender;
	raceCategoryLength?: RaceCategoryLength;
	raceRanking?: RaceRanking;
	raceResults?: RaceResultWithRelations[];
}

import type { RaceCategoryDB, RaceCategoryGenderDB, RaceCategoryLengthDB } from '$lib/types/db';
import type { RaceCategory, RaceCategoryGender, RaceCategoryLength } from '$lib/types/domain/race-category.domain';
import { mapTimestamps } from './common.adapter';

/**
 * Adapts a raw database race category row to domain RaceCategory type.
 */
export function adaptRaceCategoryFromDb(dbCategory: RaceCategoryDB): RaceCategory {
	return {
		id: dbCategory.id,
		name: dbCategory.name,
		...mapTimestamps(dbCategory)
	};
}

/**
 * Adapts a raw database race category gender row to domain RaceCategoryGender type.
 */
export function adaptRaceCategoryGenderFromDb(
	dbGender: RaceCategoryGenderDB
): RaceCategoryGender {
	return {
		id: dbGender.id,
		name: dbGender.name,
		...mapTimestamps(dbGender)
	};
}

/**
 * Adapts a raw database race category length row to domain RaceCategoryLength type.
 */
export function adaptRaceCategoryLengthFromDb(
	dbLength: RaceCategoryLengthDB
): RaceCategoryLength {
	return {
		id: dbLength.id,
		name: dbLength.name,
		...mapTimestamps(dbLength)
	};
}

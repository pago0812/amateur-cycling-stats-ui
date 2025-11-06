/**
 * Cyclist Genders Adapter
 *
 * Transforms database types (snake_case) to domain types (camelCase) for cyclist genders.
 */

import type { CyclistGenderDB } from '$lib/types/db';
import type { CyclistGender } from '$lib/types/domain';
import { mapTimestamps } from './common.adapter';

/**
 * Transform CyclistGenderDB (database type) to CyclistGender (domain type).
 * Maps snake_case fields to camelCase.
 */
export function adaptCyclistGenderFromDb(dbCyclistGender: CyclistGenderDB): CyclistGender {
	return {
		// Identity
		id: dbCyclistGender.id,

		// Basic Info
		name: dbCyclistGender.name,

		// Timestamps
		...mapTimestamps(dbCyclistGender)
	};
}

import type { User } from './user.domain';
import type { CyclistGender } from './cyclist-gender.domain';
import type { RaceResultWithRelations } from './race-result.domain';

/**
 * Cyclist domain type - athlete profile.
 * All fields use camelCase convention.
 * Names are stored in the linked User record.
 */
export interface Cyclist {
	// Identity
	id: string;

	// Basic Info
	bornYear: number | null;

	// Relationships (Foreign Keys)
	genderId: string | null;
	userId: string; // Always required - every cyclist has a linked user (for name storage)

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

/**
 * Cyclist with populated relationships.
 * Used when fetching cyclist profile with race history and user account.
 */
export interface CyclistWithRelations extends Cyclist {
	// Populated relationships
	gender?: CyclistGender;
	user?: User;
	raceResults?: RaceResultWithRelations[];
}

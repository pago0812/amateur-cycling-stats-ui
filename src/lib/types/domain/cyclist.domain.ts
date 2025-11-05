import type { User } from './user.domain';
import type { CyclistGender } from './cyclist-gender.domain';
import type { RaceResult } from './race-result.domain';

/**
 * Cyclist domain type - athlete profile.
 * All fields use camelCase convention.
 */
export interface Cyclist {
	// Identity
	id: string;

	// Basic Info
	name: string;
	lastName: string;
	bornYear: number | null;

	// Relationships (Foreign Keys)
	genderId: string | null;
	userId: string | null; // Link to user account (optional - organizers can create cyclists without accounts)

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
	raceResults?: RaceResult[];
}

import type { UserOld } from './user.domain';
import type { CyclistGender } from './cyclist-gender.domain';
import type { RaceResultWithRelations } from './race-result.domain';

/**
 * Cyclist domain type - athlete profile (flattened structure).
 * All fields use camelCase convention.
 * Combines data from users, auth.users, roles, and cyclists tables.
 * Supports both authenticated cyclists (hasAuth=true) and anonymous cyclists (hasAuth=false).
 */
export interface Cyclist {
	// From users table (public.users)
	id: string; // short_id from users table
	firstName: string;
	lastName: string;
	createdAt: string;
	updatedAt: string;

	// From auth.users table (nullable for anonymous cyclists)
	email: string | null;
	displayName: string | null;
	hasAuth: boolean; // Can be false for anonymous cyclists

	// From roles table (nullable for anonymous cyclists)
	roleType: 'CYCLIST' | null;

	// From cyclists table
	gender: CyclistGender | null;
	bornYear: number | null;
}

/**
 * @deprecated Legacy cyclist type - use new Cyclist interface instead.
 * Old cyclist domain type - athlete profile.
 * All fields use camelCase convention.
 * Names are stored in the linked User record.
 */
export interface CyclistOld {
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
export interface CyclistWithRelations extends CyclistOld {
	// Populated relationships
	gender?: CyclistGender;
	user?: UserOld;
	raceResults?: RaceResultWithRelations[];
}

import type { CyclistGender } from './cyclist-gender.domain';
import { RoleTypeEnum } from './role-type.domain';

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
	roleType: RoleTypeEnum.CYCLIST | null;

	// From cyclists table
	gender: CyclistGender | null;
	bornYear: number | null;
}

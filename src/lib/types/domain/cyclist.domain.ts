import { RoleTypeEnum } from './role-type.domain';

/**
 * Cyclist domain type - athlete profile (flattened structure).
 * All fields use camelCase convention.
 * Combines data from users, auth.users, roles, and cyclists tables.
 * Supports both authenticated cyclists (hasAuth=true) and anonymous cyclists (hasAuth=false).
 */
export interface Cyclist {
	// Identity
	id: string; // UUID from users table

	// Basic Info
	firstName: string;
	lastName: string;

	// Auth Info (nullable for anonymous cyclists)
	email: string | null;
	displayName: string | null;
	hasAuth: boolean; // Can be false for anonymous cyclists

	// Role (nullable for anonymous cyclists)
	roleType: RoleTypeEnum.CYCLIST | null;

	// Cyclist-specific Data
	genderName: string | null; // Gender name (e.g., "M", "F") from cyclist_genders table
	bornYear: number | null;

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

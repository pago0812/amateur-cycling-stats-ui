import { RoleTypeEnum } from './role-type.domain';

/**
 * Admin domain type - system administrator.
 * All fields use camelCase convention.
 * Flattened structure combining data from users, auth.users, and roles tables.
 */
export interface Admin {
	// Identity
	id: string; // UUID from users table

	// Basic Info
	firstName: string;
	lastName: string;

	// Auth Info
	email: string;
	displayName: string | null;
	hasAuth: boolean; // Always true for Admin

	// Role
	roleType: RoleTypeEnum.ADMIN;

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

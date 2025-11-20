import { RoleTypeEnum } from './role-type.domain';

/**
 * Organizer domain type - staff/owner of an organization (flattened structure).
 * All fields use camelCase convention.
 * Combines data from users, auth.users, roles, and organizers tables.
 */
export interface Organizer {
	// Identity
	id: string; // UUID from users table

	// Basic Info
	firstName: string;
	lastName: string;

	// Auth Info
	email: string;
	displayName: string | null;
	hasAuth: boolean; // Always true for Organizer

	// Role
	roleType: RoleTypeEnum.ORGANIZER_OWNER | RoleTypeEnum.ORGANIZER_STAFF;

	// Organizer-specific Data
	organizationId: string;

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

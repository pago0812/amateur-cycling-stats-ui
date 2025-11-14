import type { Role } from './role.domain';
import type { Cyclist } from './cyclist.domain';
import type { OrganizerWithRelations } from './organizer.domain';

/**
 * User domain type - user profile (can be linked to auth or standalone).
 * All fields use camelCase convention.
 */
export interface User {
	// Identity
	id: string;

	// Basic Info
	firstName: string;
	lastName: string | null;
	email?: string; // From auth.users, optional (may not exist for unlinked users)

	// Relationships (Foreign Keys)
	roleId: string;

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

/**
 * User with populated relationships.
 * Used when fetching user profile with role, cyclist profile, and organizer info.
 */
export interface UserWithRelations extends User {
	// Populated relationships
	role?: Role;
	cyclist?: Cyclist; // Populated if user is a cyclist
	organizer?: OrganizerWithRelations; // Populated if user is an organizer (includes organization)
}

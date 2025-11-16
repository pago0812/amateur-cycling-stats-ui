import type { UserWithRelations } from './user.domain';
import type { Organization } from './organization.domain';
import { RoleTypeEnum } from './role-type.domain';

/**
 * Organizer domain type - staff/owner of an organization (flattened structure).
 * All fields use camelCase convention.
 * Combines data from users, auth.users, roles, and organizers tables.
 */
export interface Organizer {
	// From users table (public.users)
	id: string; // UUID from users table
	firstName: string;
	lastName: string;
	createdAt: string;
	updatedAt: string;

	// From auth.users table
	email: string;
	displayName: string | null;
	hasAuth: boolean; // Always true for Organizer

	// From roles table
	roleType: RoleTypeEnum.ORGANIZER_OWNER | RoleTypeEnum.ORGANIZER_STAFF;

	// From organizers table
	organizationId: string;
}

/**
 * @deprecated Legacy organizer type - use new Organizer interface instead.
 * Old organizer domain type - junction table linking users to organizations.
 * All fields use camelCase convention.
 */
export interface OrganizerOld {
	// Identity
	id: string;

	// Relationships (Foreign Keys)
	userId: string;
	organizationId: string;

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

/**
 * Organizer with populated relationships.
 * Used when fetching organizer with user and organization info.
 */
export interface OrganizerWithRelations extends OrganizerOld {
	// Populated relationships
	user?: UserWithRelations; // Changed from User to UserWithRelations to include role info
	organization?: Organization;
}

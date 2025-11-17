import type { OrganizerOld, Organization, Role } from '$lib/types/domain';

/**
 * Service Response Types for Organizers
 *
 * These types represent structures returned by organizer service methods.
 * They are legacy types with nested relationships pending migration to flattened pattern.
 */

/**
 * @deprecated Legacy user type with relations - use new User union type instead.
 * Only used as part of OrganizerWithRelations pending migration to flattened pattern.
 *
 * User with populated relationships.
 * Used when fetching user profile with role, cyclist profile, and organizer info.
 */
export interface UserWithRelations {
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

	// Populated relationships
	role?: Role;
	// Note: cyclist and organizer properties omitted as they're not needed for organizer context
}

/**
 * @deprecated Legacy type - use new Organizer interface for new code.
 * Still used in MembersTable component pending migration to flattened pattern.
 *
 * Organizer with populated relationships.
 * Returned by getOrganizersByOrganizationId() service method.
 * Used when fetching organizer with user and organization info.
 */
export interface OrganizerWithRelations extends OrganizerOld {
	// Populated relationships
	user?: UserWithRelations;
	organization?: Organization;
}

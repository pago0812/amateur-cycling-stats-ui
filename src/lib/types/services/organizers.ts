import type { OrganizerOld, Organization, Role } from '$lib/types/domain';

/**
 * ============================================================================
 * DEPRECATION NOTICE - organizers.ts
 * ============================================================================
 *
 * These types represent the OLD nested relationship pattern and are being phased out.
 *
 * Migration timeline:
 * - Current: Used only in MembersTable.svelte
 * - Target: Migrate to new Organizer domain type + parallel fetching
 * - Removal: After MembersTable migration (target: Q1 2025)
 *
 * For new code, use:
 * - Domain types: Organizer, User (from $lib/types/domain)
 * - Parallel fetching: Promise.all([getOrganizer(), getUser()])
 */

// ============================================================================
// Legacy Response Types (DO NOT USE - Pending Migration)
// ============================================================================

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

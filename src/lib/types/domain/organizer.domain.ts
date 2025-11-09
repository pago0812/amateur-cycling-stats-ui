import type { User, UserWithRelations } from './user.domain';
import type { Organization } from './organization.domain';

/**
 * Organizer domain type - junction table linking users to organizations.
 * All fields use camelCase convention.
 */
export interface Organizer {
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
export interface OrganizerWithRelations extends Organizer {
	// Populated relationships
	user?: UserWithRelations; // Changed from User to UserWithRelations to include role info
	organization?: Organization;
}

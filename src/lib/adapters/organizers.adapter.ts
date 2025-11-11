/**
 * Organizers Adapter
 *
 * Transforms database types (snake_case) to domain types (camelCase) for organizers.
 */

import type { OrganizerDB, OrganizerWithUserResponse } from '$lib/types/db';
import type { Organizer, OrganizerWithRelations, UserWithRelations } from '$lib/types/domain';
import { mapTimestamps } from './common.adapter';

/**
 * Transform OrganizerDB (database type) to Organizer (domain type).
 * Maps snake_case fields to camelCase.
 */
export function adaptOrganizerFromDb(dbOrganizer: OrganizerDB): Organizer {
	return {
		// Identity
		id: dbOrganizer.short_id, // Translate: short_id → id

		// Relationships (Foreign Keys)
		userId: dbOrganizer.user_id,
		organizationId: dbOrganizer.organization_id,

		// Timestamps
		...mapTimestamps(dbOrganizer)
	};
}

/**
 * Transform OrganizerWithUserResponse (database type with user relations)
 * to OrganizerWithRelations (domain type with populated user and role).
 */
export function adaptOrganizerWithUserFromDb(
	dbOrganizer: OrganizerWithUserResponse
): OrganizerWithRelations {
	const baseOrganizer = adaptOrganizerFromDb(dbOrganizer);

	// Transform user with role
	const user: UserWithRelations = {
		id: dbOrganizer.users.short_id,
		firstName: dbOrganizer.users.first_name,
		lastName: dbOrganizer.users.last_name,
		roleId: dbOrganizer.users.role_id,
		...mapTimestamps(dbOrganizer.users),
		role: {
			id: dbOrganizer.users.roles.short_id,
			name: dbOrganizer.users.roles.name,
			...mapTimestamps(dbOrganizer.users.roles)
		}
	};

	return {
		...baseOrganizer,
		user
	};
}

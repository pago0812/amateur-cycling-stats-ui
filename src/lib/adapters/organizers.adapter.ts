/**
 * Organizers Adapter
 *
 * Transforms database types (snake_case) to domain types (camelCase) for organizers.
 */

import type { OrganizerDB } from '$lib/types/db';
import type { Organizer } from '$lib/types/domain';
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

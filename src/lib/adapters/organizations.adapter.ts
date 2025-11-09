/**
 * Organizations Adapter
 *
 * Transforms database types (snake_case) to domain types (camelCase) for organizations.
 */

import type { OrganizationDB } from '$lib/types/db';
import type { Organization } from '$lib/types/domain';
import { mapTimestamps } from './common.adapter';

/**
 * Transform OrganizationDB (database type) to Organization (domain type).
 * Maps snake_case fields to camelCase.
 */
export function adaptOrganizationFromDb(dbOrganization: OrganizationDB): Organization {
	return {
		// Identity
		id: dbOrganization.short_id, // Translate: short_id → id

		// Basic Info
		name: dbOrganization.name,
		description: dbOrganization.description,

		// Status
		isActive: dbOrganization.is_active,

		// Timestamps
		...mapTimestamps(dbOrganization)
	};
}

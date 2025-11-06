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
		id: dbOrganization.id,

		// Basic Info
		name: dbOrganization.name,
		description: dbOrganization.description,

		// Timestamps
		...mapTimestamps(dbOrganization)
	};
}

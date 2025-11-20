/**
 * Organizations Adapter
 *
 * Transforms database types (snake_case) to domain types (camelCase) for organizations.
 */

import type { OrganizationTableDB } from '$lib/types/db';
import type { Organization, OrganizationState, PartialOrganization } from '$lib/types/domain';
import { mapTimestamps } from '../common/common.adapter';

/**
 * Transform OrganizationTableDB (database table type) to Organization (domain type).
 * Maps snake_case fields to camelCase.
 */
export function adaptOrganizationFromDb(dbOrganization: OrganizationTableDB): Organization {
	return {
		// Identity
		id: dbOrganization.id,

		// Basic Info
		name: dbOrganization.name,
		description: dbOrganization.description,

		// Status
		state: dbOrganization.state as OrganizationState,

		// Timestamps
		...mapTimestamps(dbOrganization)
	};
}

/**
 * Transform PartialOrganization (domain type) to database format for RPC updates.
 * Only includes fields that are defined in the partial object.
 * This is the reverse of adaptOrganizationFromDb.
 */
export function adaptOrganizationFromDomain(
	partial: PartialOrganization
): Record<string, string | null> {
	const dbData: Record<string, string | null> = {};

	// Only include defined fields (support partial updates)
	if (partial.name !== undefined) dbData.name = partial.name;
	if (partial.description !== undefined) dbData.description = partial.description;
	if (partial.state !== undefined) dbData.state = partial.state;

	return dbData;
}

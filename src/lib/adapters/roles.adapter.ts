/**
 * Roles Adapter
 *
 * Transforms database types (snake_case) to domain types (camelCase) for roles.
 */

import type { RoleDB } from '$lib/types/db';
import type { Role } from '$lib/types/domain';
import { mapTimestamps } from './common.adapter';

/**
 * Transform RoleDB (database type) to Role (domain type).
 * Maps snake_case fields to camelCase.
 */
export function adaptRoleFromDb(dbRole: RoleDB): Role {
	return {
		// Identity
		id: dbRole.short_id, // Translate: short_id → id

		// Basic Info
		name: dbRole.name,

		// Timestamps
		...mapTimestamps(dbRole)
	};
}

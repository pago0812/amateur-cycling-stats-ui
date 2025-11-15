/**
 * Organizers Adapter
 *
 * Transforms database types (snake_case) to domain types (camelCase) for organizers.
 */

import type { OrganizerDB, OrganizerWithUserResponse, AuthUserRpcResponse } from '$lib/types/db';
import type {
	Organizer,
	OrganizerOld,
	OrganizerWithRelations,
	UserWithRelations
} from '$lib/types/domain';
import { RoleTypeEnum } from '$lib/types/domain/role-type.domain';
import { mapTimestamps } from './common.adapter';

/**
 * Adapts the RPC response from get_auth_user to domain Organizer type (flattened).
 * Transforms snake_case → camelCase.
 */
export function adaptOrganizerFromRpc(rpcResponse: AuthUserRpcResponse): Organizer {
	if (
		rpcResponse.role.name !== RoleTypeEnum.ORGANIZER_STAFF &&
		rpcResponse.role.name !== RoleTypeEnum.ORGANIZER_OWNER
	) {
		throw new Error('Invalid role: expected ORGANIZER_STAFF or ORGANIZER_OWNER');
	}

	if (!rpcResponse.organizer) {
		throw new Error('Organizer data missing in RPC response');
	}

	const organizerData = rpcResponse.organizer;
	const roleType =
		rpcResponse.role.name === RoleTypeEnum.ORGANIZER_OWNER
			? RoleTypeEnum.ORGANIZER_OWNER
			: RoleTypeEnum.ORGANIZER_STAFF;

	return {
		id: rpcResponse.short_id,
		firstName: rpcResponse.first_name,
		lastName: rpcResponse.last_name ?? '',
		email: rpcResponse.email ?? '',
		displayName: rpcResponse.display_name ?? null,
		hasAuth: true, // Always true for organizers
		roleType,
		organizationId: organizerData.organization_id,
		...mapTimestamps(rpcResponse)
	};
}

/**
 * @deprecated Use adaptOrganizerFromRpc for new flattened Organizer type.
 * Legacy adapter for old Organizer domain type.
 * Transform OrganizerDB (database type) to OrganizerOld (domain type).
 * Maps snake_case fields to camelCase.
 */
export function adaptOrganizerFromDbOld(dbOrganizer: OrganizerDB): OrganizerOld {
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
 * Backwards compatibility alias.
 * @deprecated Use adaptOrganizerFromDbOld instead.
 */
export const adaptOrganizerFromDb = adaptOrganizerFromDbOld;

/**
 * Transform OrganizerWithUserResponse (database type with user relations)
 * to OrganizerWithRelations (domain type with populated user and role).
 */
export function adaptOrganizerWithUserFromDb(
	dbOrganizer: OrganizerWithUserResponse
): OrganizerWithRelations {
	const baseOrganizer = adaptOrganizerFromDbOld(dbOrganizer);

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

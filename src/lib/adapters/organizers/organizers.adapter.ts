/**
 * Organizers Adapter
 *
 * Transforms database types (snake_case) to domain types (camelCase) for organizers.
 */

import type { OrganizerDB, OrganizerRpcItem, AuthUserDB } from '$lib/types/db';
import type { Organizer, OrganizerOld } from '$lib/types/domain';
import { RoleTypeEnum } from '$lib/types/domain/role-type.domain';
import { mapTimestamps } from '../common/common.adapter';

/**
 * Adapts the RPC response from get_auth_user to domain Organizer type (flattened).
 * Transforms snake_case → camelCase.
 */
export function adaptOrganizerFromAuthUserRpc(rpcResponse: AuthUserDB): Organizer {
	if (
		rpcResponse.role_name !== RoleTypeEnum.ORGANIZER_STAFF &&
		rpcResponse.role_name !== RoleTypeEnum.ORGANIZER_OWNER
	) {
		throw new Error('Invalid role: expected ORGANIZER_STAFF or ORGANIZER_OWNER');
	}

	if (!rpcResponse.organizer_id) {
		throw new Error('Organizer data missing in RPC response');
	}

	const roleType =
		rpcResponse.role_name === RoleTypeEnum.ORGANIZER_OWNER
			? RoleTypeEnum.ORGANIZER_OWNER
			: RoleTypeEnum.ORGANIZER_STAFF;

	return {
		id: rpcResponse.id,
		firstName: rpcResponse.first_name,
		lastName: rpcResponse.last_name ?? '',
		email: rpcResponse.email ?? '',
		displayName: rpcResponse.display_name ?? null,
		hasAuth: true, // Always true for organizers
		roleType,
		organizationId: rpcResponse.organization_id!,
		...mapTimestamps(rpcResponse)
	};
}

/**
 * Adapt RPC response item from get_organizers_by_organization_id to Organizer domain type.
 * Transforms snake_case → camelCase for flattened organizer data.
 */
export function adaptOrganizerFromRpc(rpcItem: OrganizerRpcItem): Organizer {
	// Validate role type
	if (
		rpcItem.role_type !== RoleTypeEnum.ORGANIZER_STAFF &&
		rpcItem.role_type !== RoleTypeEnum.ORGANIZER_OWNER
	) {
		throw new Error(
			`Invalid role type for organizer: ${rpcItem.role_type}. Expected ORGANIZER_STAFF or ORGANIZER_OWNER.`
		);
	}

	return {
		id: rpcItem.id,
		firstName: rpcItem.first_name,
		lastName: rpcItem.last_name,
		email: rpcItem.email,
		displayName: rpcItem.display_name,
		hasAuth: rpcItem.has_auth,
		roleType: rpcItem.role_type as RoleTypeEnum.ORGANIZER_OWNER | RoleTypeEnum.ORGANIZER_STAFF,
		organizationId: rpcItem.organization_id,
		...mapTimestamps(rpcItem)
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
		id: dbOrganizer.id,

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

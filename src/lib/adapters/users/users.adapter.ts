import type { User } from '$lib/types/domain';
import type { AuthUserDB } from '$lib/types/db';
import { RoleTypeEnum } from '$lib/types/domain/role-type.domain';
import { adaptAdminFromRpc } from '../admin/admin.adapter';
import { adaptOrganizerFromAuthUserRpc } from '../organizers/organizers.adapter';
import { adaptCyclistFromRpc } from '../cyclists/cyclists.adapter';

/**
 * Adapts the RPC response from get_auth_user to domain User union type.
 * Routes to the appropriate adapter based on the user's role.
 * Returns Admin | Organizer | Cyclist based on role type.
 */
export function adaptAuthUserFromRpc(rpcResponse: AuthUserDB): User {
	const roleName = rpcResponse.role_name;

	switch (roleName) {
		case RoleTypeEnum.ADMIN:
			return adaptAdminFromRpc(rpcResponse);
		case RoleTypeEnum.ORGANIZER_STAFF:
		case RoleTypeEnum.ORGANIZER_OWNER:
			return adaptOrganizerFromAuthUserRpc(rpcResponse);
		case RoleTypeEnum.CYCLIST:
			return adaptCyclistFromRpc(rpcResponse);
		default:
			throw new Error(`Unknown role: ${roleName}`);
	}
}

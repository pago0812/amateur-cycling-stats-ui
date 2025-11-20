import type { Admin } from '$lib/types/domain';
import type { AuthUserDB } from '$lib/types/db';
import { RoleTypeEnum } from '$lib/types/domain/role-type.domain';
import { mapTimestamps } from '../common/common.adapter';

/**
 * Adapts the RPC response from get_auth_user to domain Admin type.
 * Transforms snake_case → camelCase.
 */
export function adaptAdminFromRpc(rpcResponse: AuthUserDB): Admin {
	if (rpcResponse.role_name !== RoleTypeEnum.ADMIN) {
		throw new Error('Invalid role: expected ADMIN');
	}

	return {
		id: rpcResponse.id,
		firstName: rpcResponse.first_name,
		lastName: rpcResponse.last_name ?? '',
		email: rpcResponse.email ?? '',
		displayName: rpcResponse.display_name ?? null,
		hasAuth: true, // Always true for admin
		roleType: RoleTypeEnum.ADMIN,
		...mapTimestamps(rpcResponse)
	};
}

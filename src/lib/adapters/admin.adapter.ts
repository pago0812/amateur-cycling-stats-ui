import type { Admin } from '$lib/types/domain';
import type { AuthUserRpcResponse } from '$lib/types/db';
import { RoleTypeEnum } from '$lib/types/domain/role-type.domain';
import { mapTimestamps } from './common.adapter';

/**
 * Adapts the RPC response from get_auth_user to domain Admin type.
 * Transforms snake_case → camelCase.
 */
export function adaptAdminFromRpc(rpcResponse: AuthUserRpcResponse): Admin {
	if (rpcResponse.role.name !== RoleTypeEnum.ADMIN) {
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

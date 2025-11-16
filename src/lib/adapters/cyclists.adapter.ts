import type { Cyclist } from '$lib/types/domain/cyclist.domain';
import type { AuthUserRpcResponse } from '$lib/types/db';
import { RoleTypeEnum } from '$lib/types/domain/role-type.domain';
import { mapTimestamps } from './common.adapter';

/**
 * Adapts the RPC response from get_auth_user to domain Cyclist type (flattened).
 * Transforms snake_case → camelCase.
 * Note: gender field is null - full gender object would need separate fetch.
 */
export function adaptCyclistFromRpc(rpcResponse: AuthUserRpcResponse): Cyclist {
	if (rpcResponse.role.name !== RoleTypeEnum.CYCLIST) {
		throw new Error('Invalid role: expected CYCLIST');
	}

	if (!rpcResponse.cyclist) {
		throw new Error('Cyclist data missing in RPC response');
	}

	const cyclistData = rpcResponse.cyclist;

	return {
		id: rpcResponse.id,
		firstName: rpcResponse.first_name,
		lastName: rpcResponse.last_name ?? '',
		email: rpcResponse.email ?? null,
		displayName: rpcResponse.display_name ?? null,
		hasAuth: rpcResponse.email != null,
		roleType: RoleTypeEnum.CYCLIST,
		gender: null, // Gender object not included in RPC response, only gender_id
		bornYear: cyclistData.born_year,
		...mapTimestamps(rpcResponse)
	};
}

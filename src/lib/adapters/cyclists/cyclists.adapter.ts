import type { Cyclist } from '$lib/types/domain/cyclist.domain';
import type { AuthUserDB } from '$lib/types/db';
import { RoleTypeEnum } from '$lib/types/domain/role-type.domain';
import { mapTimestamps } from '../common/common.adapter';

/**
 * Adapts the RPC response from get_auth_user to domain Cyclist type (flattened).
 * Transforms snake_case → camelCase.
 */
export function adaptCyclistFromRpc(rpcResponse: AuthUserDB): Cyclist {
	if (rpcResponse.role_name !== RoleTypeEnum.CYCLIST) {
		throw new Error('Invalid role: expected CYCLIST');
	}

	if (!rpcResponse.cyclist_id) {
		throw new Error('Cyclist data missing in RPC response');
	}

	return {
		id: rpcResponse.id,
		firstName: rpcResponse.first_name,
		lastName: rpcResponse.last_name ?? '',
		email: rpcResponse.email ?? null,
		displayName: rpcResponse.display_name ?? null,
		hasAuth: rpcResponse.email != null,
		roleType: RoleTypeEnum.CYCLIST,
		genderName: rpcResponse.cyclist_gender_name ?? null,
		bornYear: rpcResponse.cyclist_born_year,
		...mapTimestamps(rpcResponse)
	};
}

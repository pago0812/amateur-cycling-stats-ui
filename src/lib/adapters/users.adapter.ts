import type { UserWithRelations } from '$lib/types/domain';
import type { UserWithRelationsRpcResponse } from '$lib/types/db';
import { mapTimestamps } from './common.adapter';
import { adaptOrganizationFromDb } from './organizations.adapter';
import { adaptOrganizerFromDb } from './organizers.adapter';
import { adaptRoleFromDb } from './roles.adapter';
import { adaptCyclistFromDb } from './cyclists.adapter';

/**
 * Adapts the RPC response from get_user_with_relations to domain UserWithRelations type.
 * Transforms snake_case → camelCase for all nested objects.
 */
export function adaptUserWithRelationsFromRpc(
	rpcResponse: UserWithRelationsRpcResponse
): UserWithRelations {
	return {
		id: rpcResponse.short_id,
		firstName: rpcResponse.first_name,
		lastName: rpcResponse.last_name,
		roleId: rpcResponse.role_id,
		...mapTimestamps(rpcResponse),
		role: adaptRoleFromDb(rpcResponse.role),
		cyclist: rpcResponse.cyclist ? adaptCyclistFromDb(rpcResponse.cyclist) : undefined,
		organizer: rpcResponse.organizer
			? {
					...adaptOrganizerFromDb(rpcResponse.organizer),
					organization: adaptOrganizationFromDb(rpcResponse.organizer.organization)
				}
			: undefined
	};
}

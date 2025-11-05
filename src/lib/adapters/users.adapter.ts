import type { UserWithRelations, RoleName } from '$lib/types/domain';
import type { UserWithRelationsRpcResponse } from '$lib/types/db';
import { mapTimestamps } from './common.adapter';

/**
 * Adapts the RPC response from get_user_with_relations to domain UserWithRelations type.
 * Transforms snake_case → camelCase for all nested objects.
 */
export function adaptUserWithRelationsFromRpc(
	rpcResponse: UserWithRelationsRpcResponse
): UserWithRelations {
	return {
		id: rpcResponse.id,
		username: rpcResponse.username,
		roleId: rpcResponse.role_id,
		...mapTimestamps(rpcResponse),
		role: {
			id: rpcResponse.role.id,
			name: rpcResponse.role.name as RoleName,
			type: rpcResponse.role.type,
			description: rpcResponse.role.description,
			createdAt: rpcResponse.created_at,
			updatedAt: rpcResponse.updated_at
		},
		cyclist: rpcResponse.cyclist
			? {
					id: rpcResponse.cyclist.id,
					userId: rpcResponse.cyclist.user_id,
					name: rpcResponse.cyclist.name,
					lastName: rpcResponse.cyclist.last_name,
					bornYear: rpcResponse.cyclist.born_year,
					genderId: rpcResponse.cyclist.gender_id,
					...mapTimestamps(rpcResponse.cyclist)
				}
			: undefined,
		organizer: rpcResponse.organizer
			? {
					id: rpcResponse.organizer.id,
					userId: rpcResponse.organizer.user_id,
					organizationId: rpcResponse.organizer.organization_id,
					...mapTimestamps(rpcResponse.organizer),
					organization: {
						id: rpcResponse.organizer.organization.id,
						name: rpcResponse.organizer.organization.name,
						description: rpcResponse.organizer.organization.description,
						...mapTimestamps(rpcResponse.organizer.organization)
					}
				}
			: undefined
	};
}

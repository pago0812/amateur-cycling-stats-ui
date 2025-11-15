import type { UserWithRelations, User } from '$lib/types/domain';
import type { UserWithRelationsRpcResponse, AuthUserRpcResponse } from '$lib/types/db';
import { mapTimestamps } from './common.adapter';
import { adaptOrganizationFromDb } from './organizations.adapter';
import { adaptOrganizerFromDb } from './organizers.adapter';
import { adaptRoleFromDb } from './roles.adapter';
import { adaptAdminFromRpc } from './admin.adapter';
import { adaptOrganizerFromRpc } from './organizers.adapter';
import { adaptCyclistFromRpc } from './cyclists.adapter';

/**
 * Adapts the RPC response from get_auth_user to domain User union type.
 * Routes to the appropriate adapter based on the user's role.
 * Returns Admin | Organizer | Cyclist based on role type.
 */
export function adaptAuthUserFromRpc(rpcResponse: AuthUserRpcResponse): User {
	const roleName = rpcResponse.role.name;

	switch (roleName) {
		case 'ADMIN':
			return adaptAdminFromRpc(rpcResponse);
		case 'ORGANIZER_STAFF':
		case 'ORGANIZER_OWNER':
			return adaptOrganizerFromRpc(rpcResponse);
		case 'CYCLIST':
			return adaptCyclistFromRpc(rpcResponse);
		default:
			throw new Error(`Unknown role: ${roleName}`);
	}
}

/**
 * @deprecated Use adaptAuthUserFromRpc for new User union type.
 * Legacy adapter for UserWithRelations type.
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
		email: rpcResponse.email ?? undefined,
		roleId: rpcResponse.role_id,
		...mapTimestamps(rpcResponse),
		role: adaptRoleFromDb(rpcResponse.role),
		cyclist: rpcResponse.cyclist
			? {
					id: rpcResponse.cyclist.short_id,
					bornYear: rpcResponse.cyclist.born_year,
					genderId: rpcResponse.cyclist.gender_id,
					userId: rpcResponse.cyclist.user_id,
					...mapTimestamps(rpcResponse.cyclist)
				}
			: undefined,
		organizer: rpcResponse.organizer
			? {
					...adaptOrganizerFromDb(rpcResponse.organizer),
					organization: adaptOrganizationFromDb(rpcResponse.organizer.organization)
				}
			: undefined
	};
}

/**
 * Role domain type - user role defining permissions.
 * All fields use camelCase convention.
 *
 * Note: Use RoleTypeEnum from './role-type.domain' for role type values.
 * The 'PUBLIC' role exists in the database but public users are unauthenticated and don't have a role.
 */
export interface Role {
	// Identity
	id: string;

	// Basic Info
	name: string;

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

/**
 * Role name type - user role names defining permissions.
 * Note: 'PUBLIC' role exists but public users are unauthenticated and don't have a role.
 */
export type RoleName = 'CYCLIST' | 'ORGANIZER_STAFF' | 'ORGANIZER_OWNER' | 'ADMIN';

/**
 * Role type for new flattened domain types.
 * Maps to role names in uppercase format.
 */
export type RoleType = 'CYCLIST' | 'ORGANIZER_STAFF' | 'ORGANIZER_OWNER' | 'ADMIN';

/**
 * Role domain type - user role defining permissions.
 * All fields use camelCase convention.
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

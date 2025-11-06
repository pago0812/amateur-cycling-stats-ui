/**
 * Role name type - user role names defining permissions.
 */
export type RoleName = 'public' | 'cyclist' | 'organizer_staff' | 'organizer' | 'admin';

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

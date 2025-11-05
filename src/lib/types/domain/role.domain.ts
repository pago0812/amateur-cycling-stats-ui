/**
 * Role name enum
 */
export type RoleName = 'public' | 'cyclist' | 'organizer_staff' | 'organizer_admin' | 'admin';

/**
 * Role domain type - user role defining permissions.
 * All fields use camelCase convention.
 */
export interface Role {
	// Identity
	id: string;

	// Basic Info
	name: RoleName;
	type: string; // Role type identifier (e.g., 'cyclist', 'organizer', 'authenticated', 'public')
	description: string | null;

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

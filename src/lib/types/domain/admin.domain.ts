/**
 * Admin domain type - system administrator.
 * All fields use camelCase convention.
 * Flattened structure combining data from users, auth.users, and roles tables.
 */
export interface Admin {
	// From users table (public.users)
	id: string; // short_id from users table
	firstName: string;
	lastName: string;
	createdAt: string;
	updatedAt: string;

	// From auth.users table
	email: string;
	displayName: string | null;
	hasAuth: boolean; // Always true for Admin

	// From roles table
	roleType: 'ADMIN';
}

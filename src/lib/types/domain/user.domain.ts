import type { Admin } from './admin.domain';
import type { Organizer } from './organizer.domain';
import type { Cyclist } from './cyclist.domain';

/**
 * User union type - authenticated user (flattened structure).
 * A user is either an Admin, Organizer, or Cyclist.
 * Use this type for authenticated user data (e.g., from getAuthUser()).
 */
export type User = Admin | Organizer | Cyclist;

/**
 * @deprecated Legacy user type - use new User union type instead.
 * Old user domain type - user profile (can be linked to auth or standalone).
 * All fields use camelCase convention.
 */
export interface UserOld {
	// Identity
	id: string;

	// Basic Info
	firstName: string;
	lastName: string | null;
	email?: string; // From auth.users, optional (may not exist for unlinked users)

	// Relationships (Foreign Keys)
	roleId: string;

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

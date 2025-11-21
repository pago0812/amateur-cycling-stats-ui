import type { Admin } from './admin.domain';
import type { Organizer } from './organizer.domain';
import type { Cyclist } from './cyclist.domain';

/**
 * User union type - authenticated user (flattened structure).
 * A user is either an Admin, Organizer, or Cyclist.
 * Use this type for authenticated user data (e.g., from getAuthUser()).
 */
export type User = Admin | Organizer | Cyclist;

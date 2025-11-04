import type { Tables } from '$lib/types/database.types';
import type { Role } from './roles';

// Base user type from Supabase
export type User = Tables<'users'>;

// Extended user type with populated relationships
export interface UserWithRelations extends User {
	role?: Role;
}

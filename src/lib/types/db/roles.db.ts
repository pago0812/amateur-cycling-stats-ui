import type { Tables } from '../database.types';

/**
 * Database type for roles table.
 * Use this instead of Tables<'roles'> throughout the codebase.
 */
export type RoleDB = Tables<'roles'>;

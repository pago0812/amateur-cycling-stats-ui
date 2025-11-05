import type { Tables } from '../database.types';

/**
 * Database type for organizations table.
 * Use this instead of Tables<'organizations'> throughout the codebase.
 */
export type OrganizationDB = Tables<'organizations'>;

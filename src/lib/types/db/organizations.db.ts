import type { Tables } from '../database.types';

/**
 * Database type for organizations table.
 * Use this instead of Tables<'organizations'> throughout the codebase.
 *
 * Note: Manually overridden to use 'state' field instead of 'is_active'
 * until database.types.ts is regenerated from updated schema.
 */
export type OrganizationDB = Omit<Tables<'organizations'>, 'is_active'> & {
	state: 'WAITING_OWNER' | 'ACTIVE' | 'DISABLED';
};

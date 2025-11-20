import type { Database, Tables } from '../database.types';

/**
 * Database type for organizations table.
 * Use this for direct table operations.
 */
export type OrganizationTableDB = Tables<'organizations'>;

/**
 * Auto-generated type for organization RPC response.
 * Returned by update_organization() RPC function.
 * Returns single updated organization record (extract first element from array).
 */
export type OrganizationDB =
	Database['public']['Functions']['update_organization']['Returns'][number];

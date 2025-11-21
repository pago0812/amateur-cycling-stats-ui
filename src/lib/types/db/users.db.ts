import type { Tables, Database } from '../database.types';

/**
 * Database type for users table.
 * Use this instead of Tables<'users'> throughout the codebase.
 */
export type UserDB = Tables<'users'>;

/**
 * Flattened database type for enriched user data returned by get_auth_user RPC.
 * This is an alias to the auto-generated Supabase type from RETURNS TABLE.
 * The RPC returns an array, this type represents a single row.
 * Use the adapter to transform this to domain User types.
 */
export type AuthUserDB = Database['public']['Functions']['get_auth_user']['Returns'][0];

/**
 * Flattened database type for enriched user data returned by get_auth_user_by_email RPC.
 * This is an alias to the auto-generated Supabase type from RETURNS TABLE.
 * The RPC returns an array, this type represents a single row.
 * Use the adapter to transform this to domain User types.
 */
export type UserByEmailDB = Database['public']['Functions']['get_auth_user_by_email']['Returns'][0];

/**
 * Flattened database type for enriched user data returned by get_auth_user_by_id RPC.
 * This is an alias to the auto-generated Supabase type from RETURNS TABLE.
 * The RPC returns an array, this type represents a single row.
 * Use the adapter to transform this to domain User types.
 */
export type UserByIdDB = Database['public']['Functions']['get_auth_user_by_id']['Returns'][0];

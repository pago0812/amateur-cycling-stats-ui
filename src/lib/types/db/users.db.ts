import type { Tables, Database } from '../database.types';

/**
 * Database type for users table.
 * Use this instead of Tables<'users'> throughout the codebase.
 */
export type UserDB = Tables<'users'>;

/**
 * Type for enriched user data returned by get_auth_user RPC (formerly get_user_with_relations).
 * This is the raw response from the database (snake_case).
 * Use the adapter to transform this to domain User types.
 */
export interface AuthUserRpcResponse {
	id: string; // UUID
	first_name: string;
	last_name: string | null;
	email: string | null; // From auth.users, may be null for unlinked users
	display_name: string | null; // From auth.users.raw_user_meta_data
	role_id: string;
	created_at: string;
	updated_at: string;
	role: {
		id: string; // UUID
		name: Database['public']['Enums']['role_name_enum'];
		created_at: string;
		updated_at: string;
	};
	cyclist: {
		id: string; // UUID
		user_id: string;
		born_year: number | null;
		gender_id: string | null;
		created_at: string;
		updated_at: string;
	} | null;
	organizer: {
		id: string; // UUID
		user_id: string;
		organization_id: string;
		created_at: string;
		updated_at: string;
		organization: {
			id: string; // UUID
			name: string;
			description: string | null;
			state: 'WAITING_OWNER' | 'ACTIVE' | 'DISABLED';
			created_at: string;
			updated_at: string;
		};
	} | null;
}

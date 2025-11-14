import type { Tables } from '../database.types';

/**
 * Database type for users table.
 * Use this instead of Tables<'users'> throughout the codebase.
 */
export type UserDB = Tables<'users'>;

/**
 * Type for enriched user data returned by get_user_with_relations RPC.
 * This is the raw response from the database (snake_case).
 * Use the adapter to transform this to UserWithRelations domain type.
 *
 * IMPORTANT: RPC returns both id (UUID) and short_id fields.
 * Adapters translate short_id → domain.id (UUID stays internal).
 */
export interface UserWithRelationsRpcResponse {
	id: string; // UUID
	short_id: string; // NanoID
	first_name: string;
	last_name: string | null;
	email: string | null; // From auth.users, may be null for unlinked users
	role_id: string;
	created_at: string;
	updated_at: string;
	role: {
		id: string; // UUID
		short_id: string; // NanoID
		name: string;
		created_at: string;
		updated_at: string;
	};
	cyclist: {
		id: string; // UUID
		short_id: string; // NanoID
		user_id: string;
		born_year: number | null;
		gender_id: string | null;
		created_at: string;
		updated_at: string;
	} | null;
	organizer: {
		id: string; // UUID
		short_id: string; // NanoID
		user_id: string;
		organization_id: string;
		created_at: string;
		updated_at: string;
		organization: {
			id: string; // UUID
			short_id: string; // NanoID
			name: string;
			description: string | null;
			state: 'WAITING_OWNER' | 'ACTIVE' | 'DISABLED';
			created_at: string;
			updated_at: string;
		};
	} | null;
}

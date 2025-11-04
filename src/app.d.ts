// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

// Type for enriched user data returned by get_user_with_relations
export interface UserWithRelations {
	id: string;
	username: string;
	role_id: string;
	created_at: string;
	updated_at: string;
	role: {
		id: string;
		name: string;
		type: string;
		description: string | null;
	};
	cyclist: {
		id: string;
		user_id: string;
		name: string;
		last_name: string;
		born_year: number | null;
		gender_id: string | null;
		created_at: string;
		updated_at: string;
	} | null;
	organizer: {
		id: string;
		user_id: string;
		organization_id: string;
		created_at: string;
		updated_at: string;
		organization: {
			id: string;
			name: string;
			description: string | null;
			created_at: string;
			updated_at: string;
		};
	} | null;
}

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient<Database>;
			safeGetSession: () => Promise<{
				session: Session | null;
				user: UserWithRelations | null;
			}>;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

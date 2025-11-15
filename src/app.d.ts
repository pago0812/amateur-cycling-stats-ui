// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { User } from '$lib/types/domain';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient<Database>;
			safeGetSession: () => Promise<{
				session: Session | null;
				user: User | null;
			}>;
			locale: string;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

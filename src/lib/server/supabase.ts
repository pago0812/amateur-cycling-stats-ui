import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import type { Database } from '$lib/types/database.types';
import type { Cookies } from '@sveltejs/kit';

/**
 * Creates a Supabase server client for use in server-side code (hooks, +page.server.ts, +server.ts).
 * This client automatically manages cookies for authentication sessions.
 *
 * @param cookies - SvelteKit cookies object from event.cookies
 * @returns Supabase client configured for server-side use with cookie management
 */
export function createSupabaseServerClient(cookies: Cookies) {
	return createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => {
				return cookies.getAll();
			},
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});
}

/**
 * Creates a Supabase admin client with service role privileges.
 * WARNING: This client bypasses Row Level Security (RLS).
 * Only use for admin operations where RLS bypass is necessary.
 *
 * @returns Supabase client with service role privileges
 */
export function createSupabaseAdminClient() {
	return createServerClient<Database>(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		cookies: {
			getAll: () => [],
			setAll: () => {}
		}
	});
}

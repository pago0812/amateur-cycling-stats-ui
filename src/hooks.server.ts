import { createSupabaseServerClient } from '$lib/server/supabase';
import type { Handle } from '@sveltejs/kit';
import type { UserWithRelations } from './app.d';

/**
 * SvelteKit hooks for handling authentication and session management.
 * This runs on every request and validates the session, refreshing cookies automatically.
 * The authenticated user data is attached to event.locals for use in load functions.
 */
export const handle: Handle = async ({ event, resolve }) => {
	// Create Supabase client with cookie management
	event.locals.supabase = createSupabaseServerClient(event.cookies);

	/**
	 * Get the current session and user.
	 * Unlike getUser(), getSession() doesn't make an extra request to Supabase.
	 * However, it's recommended to use getUser() for critical auth checks.
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		if (!session) {
			return { session: null, user: null };
		}

		// Fetch enriched user data using our PostgreSQL function
		const { data: userData, error } = await event.locals.supabase.rpc('get_user_with_relations', {
			user_uuid: session.user.id
		});

		if (error) {
			console.error('Error fetching user with relations:', error);
			return { session, user: null };
		}

		return { session, user: userData as UserWithRelations | null };
	};

	// Resolve the request
	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			// Allow Supabase cookies to be passed to the client
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

import { createSupabaseServerClient } from '$lib/server/supabase';
import type { Handle } from '@sveltejs/kit';
import type { UserWithRelationsRpcResponse } from '$lib/types/db';
import { adaptUserWithRelationsFromRpc } from '$lib/adapters';
import { setLocaleCookie } from '$lib/utils/cookies';
import {
	parseAcceptLanguage,
	isSupportedLocale,
	LOCALE_COOKIE_NAME,
	DEFAULT_LOCALE
} from '$lib/i18n/locale';
import { dev } from '$app/environment';

/**
 * SvelteKit hooks for handling authentication, session management, and i18n.
 * This runs on every request and validates the session, refreshing cookies automatically.
 * The authenticated user data and locale are attached to event.locals for use in load functions.
 */
export const handle: Handle = async ({ event, resolve }) => {
	// Request logging in development mode
	const startTime = dev ? Date.now() : 0;

	// Create Supabase client with cookie management
	event.locals.supabase = createSupabaseServerClient(event.cookies);

	// Detect and store locale
	let locale = event.cookies.get(LOCALE_COOKIE_NAME);

	if (!locale) {
		// No cookie set, detect from Accept-Language header
		const acceptLanguage = event.request.headers.get('accept-language');
		locale = parseAcceptLanguage(acceptLanguage);

		// Store in cookie for future requests (1 year expiry)
		setLocaleCookie(event.cookies, LOCALE_COOKIE_NAME, locale);
	}

	// Validate locale is supported, fallback to default
	if (!isSupportedLocale(locale)) {
		locale = DEFAULT_LOCALE;
		setLocaleCookie(event.cookies, LOCALE_COOKIE_NAME, locale);
	}

	// Store locale in event.locals for use in load functions and API routes
	event.locals.locale = locale;

	/**
	 * Get the current authenticated user with enriched profile data.
	 * Uses get_user_with_relations() RPC which validates session via auth.uid().
	 * Returns null if no valid session or user not found in database.
	 */
	event.locals.safeGetSession = async () => {
		// Fetch enriched user data using our PostgreSQL function
		// RPC function uses auth.uid() when no parameter provided
		// RPC now includes email from auth.users directly
		const { data: rpcResponse, error } = await event.locals.supabase.rpc(
			'get_user_with_relations'
			// No parameter - RPC will use auth.uid() internally and validate session
		);

		if (error || !rpcResponse) {
			if (error) {
				// Error code 28000 = invalid_authorization_specification (no active session)
				// This is expected for unauthenticated users, so don't log it
				// Only log unexpected database errors
				if (error.code !== '28000') {
					console.error('Error fetching user with relations:', error);
				}
			}
			return { session: null, user: null };
		}

		// Transform snake_case DB response to camelCase domain type
		const userData = adaptUserWithRelationsFromRpc(
			rpcResponse as unknown as UserWithRelationsRpcResponse
		);

		return { session: null, user: userData };
	};

	// Resolve the request
	const response = await resolve(event, {
		filterSerializedResponseHeaders(name) {
			// Allow Supabase cookies to be passed to the client
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});

	// Log request in development mode
	if (dev) {
		const duration = Date.now() - startTime;
		const method = event.request.method;
		const path = event.url.pathname;
		const status = response.status;
		console.log(`[${method}] ${path} - ${status} (${duration}ms)`);
	}

	return response;
};

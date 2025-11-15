import { createSupabaseServerClient } from '$lib/server/supabase';
import type { Handle } from '@sveltejs/kit';
import { getAuthUser, isAuthenticated } from '$lib/services/users';
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
	 * First checks if authenticated, then fetches user data if session exists.
	 * Returns null if no valid session or user not found in database.
	 */
	event.locals.getSessionUser = async () => {
		try {
			// Check authentication status first (faster check)
			const authenticated = await isAuthenticated(event.locals.supabase);

			console.log('authenticated', authenticated);

			if (!authenticated) {
				return null;
			}

			// Fetch enriched user data using service function
			const user = await getAuthUser(event.locals.supabase);
			return user;
		} catch (error) {
			// Log unexpected errors (authentication errors are handled in getAuthUser)
			console.error('Error fetching authenticated user:', error);
			return null;
		}
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

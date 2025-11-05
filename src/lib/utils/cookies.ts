import type { Cookies } from '@sveltejs/kit';

/**
 * Cookie configuration for locale storage.
 * 1 year expiry, accessible from client-side, lax same-site policy.
 */
const LOCALE_COOKIE_OPTIONS = {
	path: '/',
	maxAge: 60 * 60 * 24 * 365, // 1 year
	httpOnly: false, // Allow client-side access if needed
	sameSite: 'lax' as const
};

/**
 * Set the locale cookie with standard configuration.
 * @param cookies - SvelteKit cookies object
 * @param cookieName - Name of the locale cookie
 * @param locale - Locale value to store (e.g., 'es', 'en')
 */
export function setLocaleCookie(cookies: Cookies, cookieName: string, locale: string): void {
	cookies.set(cookieName, locale, LOCALE_COOKIE_OPTIONS);
}

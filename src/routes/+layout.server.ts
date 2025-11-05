import type { LayoutServerLoad } from './$types';
import { loadTranslations } from '$lib/i18n';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Get user from session (via hooks)
	const { user } = await locals.safeGetSession();

	// Get locale from locals (set in hooks.server.ts)
	const locale = locals.locale;

	// Load translations for current locale and path
	await loadTranslations(locale, url.pathname);

	return {
		user,
		locale
	};
};

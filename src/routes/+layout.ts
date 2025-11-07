import { browser } from '$app/environment';
import { loadTranslations, locale } from '$lib/i18n';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
	if (browser) {
		let detectedLocale = data.locale;

		if (!detectedLocale) {
			const browserLang = navigator.language.split('-')[0];
			const supportedLocales = ['en', 'es'];
			detectedLocale = supportedLocales.includes(browserLang) ? browserLang : 'en';
		}

		await loadTranslations(detectedLocale);
		locale.set(detectedLocale);
	}

	return { ...data };
};

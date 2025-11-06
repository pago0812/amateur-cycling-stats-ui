/**
 * i18n Mock Utilities
 *
 * Provides mock implementations for testing components that use i18n.
 */

import { vi } from 'vitest';
import { writable } from 'svelte/store';

/**
 * Mock translation function that returns the key
 * Useful for testing components without loading actual translations
 *
 * @example
 * const mockT = createMockTranslation();
 * expect(mockT('auth.login.title')).toBe('auth.login.title');
 */
export function createMockTranslation() {
	return vi.fn((key: string, options?: { default?: string }) => {
		return options?.default || key;
	});
}

/**
 * Mock translation store that can be subscribed to
 * Mimics the behavior of sveltekit-i18n's t store
 *
 * @example
 * const mockTStore = createMockTranslationStore();
 * $: translatedText = $mockTStore('auth.login.title');
 */
export function createMockTranslationStore() {
	const mockT = createMockTranslation();
	return writable(mockT);
}

/**
 * Mock locale store
 * Mimics the behavior of sveltekit-i18n's locale store
 */
export function createMockLocaleStore(initialLocale = 'es') {
	return writable(initialLocale);
}

/**
 * Mock loading store
 * Mimics the behavior of sveltekit-i18n's loading store
 */
export function createMockLoadingStore(initialLoading = false) {
	return writable(initialLoading);
}

/**
 * Mock loadTranslations function
 */
export function createMockLoadTranslations() {
	return vi.fn(async () => {
		// Simulate async translation loading
		await new Promise((resolve) => setTimeout(resolve, 0));
	});
}

/**
 * Complete i18n mock setup
 * Mocks all exports from $lib/i18n
 *
 * @example
 * vi.mock('$lib/i18n', () => createMockI18n());
 */
export function createMockI18n(locale = 'es') {
	return {
		t: createMockTranslationStore(),
		locale: createMockLocaleStore(locale),
		locales: writable(['es', 'en']),
		loading: createMockLoadingStore(false),
		loadTranslations: createMockLoadTranslations()
	};
}

/**
 * Mock server-side translation helper
 * Returns the key or a default value
 */
export function createMockServerTranslation() {
	return vi.fn((locale: string, key: string, fallback?: string) => {
		return fallback || key;
	});
}

/**
 * Mock getAuthErrorMessage function
 */
export function createMockAuthErrorMessage() {
	return vi.fn((locale: string, errorCode: string) => {
		const errorMap: Record<string, string> = {
			invalid_credentials: locale === 'es' ? 'Email o contraseña incorrectos' : 'Invalid email or password',
			email_not_confirmed: locale === 'es' ? 'Email no confirmado' : 'Email not confirmed',
			user_not_found: locale === 'es' ? 'Usuario no encontrado' : 'User not found'
		};
		return errorMap[errorCode] || errorCode;
	});
}

/**
 * Mock category translation helpers
 */
export function createMockCategoryTranslations() {
	return {
		translateCategory: vi.fn((categoryName: string) => categoryName),
		translateGender: vi.fn((genderName: string) => genderName),
		translateLength: vi.fn((lengthName: string) => lengthName)
	};
}

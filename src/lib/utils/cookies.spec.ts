/**
 * Unit Tests: Cookies Utility
 *
 * Tests cookie management functions for locale storage.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setLocaleCookie } from './cookies';
import type { Cookies } from '@sveltejs/kit';

describe('Cookies Utility', () => {
	let mockCookies: Cookies;

	beforeEach(() => {
		mockCookies = {
			get: vi.fn(),
			set: vi.fn(),
			delete: vi.fn(),
			serialize: vi.fn(),
			getAll: vi.fn()
		} as unknown as Cookies;
	});

	describe('setLocaleCookie', () => {
		it('should set locale cookie with correct options', () => {
			setLocaleCookie(mockCookies, 'locale', 'es');

			expect(mockCookies.set).toHaveBeenCalledWith('locale', 'es', {
				path: '/',
				maxAge: 60 * 60 * 24 * 365, // 1 year
				httpOnly: false,
				sameSite: 'lax'
			});
		});

		it('should set cookie with different locale values', () => {
			const locales = ['es', 'en', 'fr', 'de'];

			locales.forEach((locale) => {
				setLocaleCookie(mockCookies, 'locale', locale);

				expect(mockCookies.set).toHaveBeenCalledWith('locale', locale, expect.any(Object));
			});
		});

		it('should set cookie with custom cookie name', () => {
			setLocaleCookie(mockCookies, 'custom-locale-name', 'es');

			expect(mockCookies.set).toHaveBeenCalledWith('custom-locale-name', 'es', expect.any(Object));
		});

		it('should use 1 year expiry (31536000 seconds)', () => {
			setLocaleCookie(mockCookies, 'locale', 'es');

			expect(mockCookies.set).toHaveBeenCalledWith(
				'locale',
				'es',
				expect.objectContaining({
					maxAge: 31536000 // 60 * 60 * 24 * 365
				})
			);
		});

		it('should set httpOnly to false for client-side access', () => {
			setLocaleCookie(mockCookies, 'locale', 'es');

			expect(mockCookies.set).toHaveBeenCalledWith(
				'locale',
				'es',
				expect.objectContaining({
					httpOnly: false
				})
			);
		});

		it('should set sameSite to lax', () => {
			setLocaleCookie(mockCookies, 'locale', 'es');

			expect(mockCookies.set).toHaveBeenCalledWith(
				'locale',
				'es',
				expect.objectContaining({
					sameSite: 'lax'
				})
			);
		});

		it('should set path to root', () => {
			setLocaleCookie(mockCookies, 'locale', 'es');

			expect(mockCookies.set).toHaveBeenCalledWith(
				'locale',
				'es',
				expect.objectContaining({
					path: '/'
				})
			);
		});

		it('should call set method exactly once per invocation', () => {
			setLocaleCookie(mockCookies, 'locale', 'es');

			expect(mockCookies.set).toHaveBeenCalledTimes(1);
		});
	});
});

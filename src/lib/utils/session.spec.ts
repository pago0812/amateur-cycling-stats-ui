/**
 * Unit Tests: Session Utility
 *
 * Tests JWT session management functions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveJWT, getJWT, revokeJWT } from './session';
import type { Cookies } from '@sveltejs/kit';

describe('Session Utility', () => {
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

	describe('saveJWT', () => {
		it('should save JWT token with correct cookie name', () => {
			const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

			saveJWT(mockCookies, jwt);

			expect(mockCookies.set).toHaveBeenCalledWith(
				'jwt-session',
				jwt,
				expect.any(Object)
			);
		});

		it('should set httpOnly to true for security', () => {
			const jwt = 'test-jwt-token';

			saveJWT(mockCookies, jwt);

			expect(mockCookies.set).toHaveBeenCalledWith(
				'jwt-session',
				jwt,
				expect.objectContaining({
					httpOnly: true
				})
			);
		});

		it('should set secure to false (development mode)', () => {
			const jwt = 'test-jwt-token';

			saveJWT(mockCookies, jwt);

			expect(mockCookies.set).toHaveBeenCalledWith(
				'jwt-session',
				jwt,
				expect.objectContaining({
					secure: false
				})
			);
		});

		it('should set sameSite to lax', () => {
			const jwt = 'test-jwt-token';

			saveJWT(mockCookies, jwt);

			expect(mockCookies.set).toHaveBeenCalledWith(
				'jwt-session',
				jwt,
				expect.objectContaining({
					sameSite: 'lax'
				})
			);
		});

		it('should set path to root', () => {
			const jwt = 'test-jwt-token';

			saveJWT(mockCookies, jwt);

			expect(mockCookies.set).toHaveBeenCalledWith(
				'jwt-session',
				jwt,
				expect.objectContaining({
					path: '/'
				})
			);
		});

		it('should set expiry to 24 hours from now', () => {
			const jwt = 'test-jwt-token';
			const beforeCall = Date.now();

			saveJWT(mockCookies, jwt);

			const afterCall = Date.now();

			// Get the expires argument
			const setCall = (mockCookies.set as ReturnType<typeof vi.fn>).mock.calls[0];
			const options = setCall[2];
			const expiresDate = options.expires as Date;

			// Should be approximately 24 hours from now
			const expectedMin = beforeCall + 24 * 60 * 60 * 1000;
			const expectedMax = afterCall + 24 * 60 * 60 * 1000;

			expect(expiresDate.getTime()).toBeGreaterThanOrEqual(expectedMin);
			expect(expiresDate.getTime()).toBeLessThanOrEqual(expectedMax);
		});

		it('should handle different JWT token formats', () => {
			const tokens = [
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.test',
				'short.jwt.token',
				'very-long-jwt-token-' + 'a'.repeat(500)
			];

			tokens.forEach((token) => {
				(mockCookies.set as ReturnType<typeof vi.fn>).mockClear();
				saveJWT(mockCookies, token);

				expect(mockCookies.set).toHaveBeenCalledWith('jwt-session', token, expect.any(Object));
			});
		});

		it('should call set method exactly once', () => {
			saveJWT(mockCookies, 'test-token');

			expect(mockCookies.set).toHaveBeenCalledTimes(1);
		});
	});

	describe('getJWT', () => {
		it('should retrieve JWT token from cookies', () => {
			const expectedToken = 'stored-jwt-token';
			(mockCookies.get as ReturnType<typeof vi.fn>).mockReturnValue(expectedToken);

			const result = getJWT(mockCookies);

			expect(mockCookies.get).toHaveBeenCalledWith('jwt-session');
			expect(result).toBe(expectedToken);
		});

		it('should return empty string when JWT is not found', () => {
			(mockCookies.get as ReturnType<typeof vi.fn>).mockReturnValue(undefined);

			const result = getJWT(mockCookies);

			expect(result).toBe('');
		});

		it('should return empty string when JWT is null', () => {
			(mockCookies.get as ReturnType<typeof vi.fn>).mockReturnValue(null);

			const result = getJWT(mockCookies);

			expect(result).toBe('');
		});

		it('should return empty string when JWT is empty string', () => {
			(mockCookies.get as ReturnType<typeof vi.fn>).mockReturnValue('');

			const result = getJWT(mockCookies);

			expect(result).toBe('');
		});

		it('should handle valid JWT tokens', () => {
			const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
			(mockCookies.get as ReturnType<typeof vi.fn>).mockReturnValue(validToken);

			const result = getJWT(mockCookies);

			expect(result).toBe(validToken);
		});
	});

	describe('revokeJWT', () => {
		it('should delete JWT cookie with correct name', () => {
			revokeJWT(mockCookies);

			expect(mockCookies.delete).toHaveBeenCalledWith('jwt-session', {
				path: '/'
			});
		});

		it('should delete cookie with path set to root', () => {
			revokeJWT(mockCookies);

			expect(mockCookies.delete).toHaveBeenCalledWith(
				'jwt-session',
				expect.objectContaining({
					path: '/'
				})
			);
		});

		it('should call delete method exactly once', () => {
			revokeJWT(mockCookies);

			expect(mockCookies.delete).toHaveBeenCalledTimes(1);
		});

		it('should be idempotent (can call multiple times)', () => {
			revokeJWT(mockCookies);
			revokeJWT(mockCookies);
			revokeJWT(mockCookies);

			expect(mockCookies.delete).toHaveBeenCalledTimes(3);
			expect(mockCookies.delete).toHaveBeenCalledWith('jwt-session', { path: '/' });
		});
	});

	describe('JWT Workflow', () => {
		it('should support save -> get -> revoke workflow', () => {
			const jwt = 'test-jwt-token';

			// Save JWT
			saveJWT(mockCookies, jwt);
			expect(mockCookies.set).toHaveBeenCalled();

			// Get JWT
			(mockCookies.get as ReturnType<typeof vi.fn>).mockReturnValue(jwt);
			const retrieved = getJWT(mockCookies);
			expect(retrieved).toBe(jwt);

			// Revoke JWT
			revokeJWT(mockCookies);
			expect(mockCookies.delete).toHaveBeenCalled();

			// Verify JWT is gone
			(mockCookies.get as ReturnType<typeof vi.fn>).mockReturnValue(undefined);
			const afterRevoke = getJWT(mockCookies);
			expect(afterRevoke).toBe('');
		});

		it('should allow overwriting existing JWT', () => {
			const oldJWT = 'old-token';
			const newJWT = 'new-token';

			saveJWT(mockCookies, oldJWT);
			expect(mockCookies.set).toHaveBeenCalledTimes(1);

			saveJWT(mockCookies, newJWT);
			expect(mockCookies.set).toHaveBeenCalledTimes(2);
			expect(mockCookies.set).toHaveBeenLastCalledWith('jwt-session', newJWT, expect.any(Object));
		});
	});
});

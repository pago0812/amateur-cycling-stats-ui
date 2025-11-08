/**
 * Authentication Helper Functions for E2E Tests
 *
 * Provides reusable functions for login/logout flows.
 * NOTE: No signup helper - user creation skipped until test database is available.
 */

import { type Page, expect } from '@playwright/test';

export interface TestUser {
	email: string;
	password: string;
}

/**
 * Log in as a test user
 * @param page - Playwright page object
 * @param user - User credentials
 */
export async function loginAs(page: Page, user: TestUser) {
	// Navigate to login page
	await page.goto('/login');

	// Wait for login form to be visible
	await page.waitForSelector('form');

	// Fill in credentials using input IDs
	await page.fill('#email', user.email);
	await page.fill('#password', user.password);

	// Submit form
	await page.getByRole('button', { name: /iniciar sesión|log in/i }).click();

	// Wait for redirect away from login page (could be /panel, /account, or /)
	await page.waitForURL((url) => url.pathname !== '/login', { timeout: 20000 });

	// Verify we're authenticated
	await expectAuthenticated(page);
}

/**
 * Log out current user
 * @param page - Playwright page object
 */
export async function logout(page: Page) {
	// Navigate to account page (where logout button is)
	await page.goto('/account');

	// Click logout button
	await page.getByRole('button', { name: /cerrar sesión|log out/i }).click();

	// Wait for redirect to home or login
	await page.waitForURL(/\/(login)?$/);

	// Verify we're logged out
	await expectUnauthenticated(page);
}

/**
 * Assert that user is authenticated
 * Checks for presence of "Cuenta" or "Account" link in header
 * @param page - Playwright page object
 */
export async function expectAuthenticated(page: Page) {
	// Wait for navigation to be visible
	await page.waitForSelector('nav');

	// Check for authenticated user link (Cuenta/Account)
	const accountLink = page.getByRole('link', { name: /cuenta|account/i });
	await expect(accountLink).toBeVisible();
}

/**
 * Assert that user is NOT authenticated
 * Checks for presence of "Iniciar sesión" or "Log in" link in header
 * @param page - Playwright page object
 */
export async function expectUnauthenticated(page: Page) {
	// Wait for navigation to be visible
	await page.waitForSelector('nav');

	// Check for login link (Iniciar sesión/Log in)
	const loginLink = page.getByRole('link', { name: /iniciar sesión|log in/i });
	await expect(loginLink).toBeVisible();
}

/**
 * Clear all authentication cookies and storage
 * Useful for ensuring clean state between tests
 * @param page - Playwright page object
 */
export async function clearAuth(page: Page) {
	// Clear all cookies for the browser context
	await page.context().clearCookies();

	// Navigate to blank page to ensure clean slate
	await page.goto('about:blank');

	// Clear storage
	try {
		await page.evaluate(() => {
			localStorage.clear();
			sessionStorage.clear();
		});
	} catch {
		// Ignore storage errors (page may not have storage access)
	}

	// Navigate to home page to reset state
	await page.goto('/');
}

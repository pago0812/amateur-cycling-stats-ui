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

	// Wait for email input to be visible (more specific than waiting for form)
	await page.waitForSelector('#email', { state: 'visible' });

	// Fill in credentials using input IDs
	await page.fill('#email', user.email);
	await page.fill('#password', user.password);

	// Submit form - use main area to avoid header button
	await page
		.getByRole('main')
		.getByRole('button', { name: /iniciar sesión|log in/i })
		.click();

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
 * Checks for presence of "Account" button/link in header navigation
 * @param page - Playwright page object
 */
export async function expectAuthenticated(page: Page) {
	// Wait for navigation to be visible
	await page.waitForSelector('nav');

	// Check for authenticated user button (Account) in navigation
	// Note: Header uses Button component with href, which renders as <a role="button">
	const accountButton = page
		.getByRole('navigation')
		.getByRole('button', { name: /account/i });
	await expect(accountButton).toBeVisible();
}

/**
 * Assert that user is NOT authenticated
 * Checks for presence of "Log in" button/link in header navigation
 * @param page - Playwright page object
 */
export async function expectUnauthenticated(page: Page) {
	// Wait for navigation to be visible
	await page.waitForSelector('nav');

	// Check for login button (Log in) in navigation
	// Note: Header uses Button component with href, which renders as <a role="button">
	const loginButton = page.getByRole('navigation').getByRole('button', { name: /log in/i });
	await expect(loginButton).toBeVisible();
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

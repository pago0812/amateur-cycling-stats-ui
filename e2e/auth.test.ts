/**
 * E2E Tests: Authentication Flows
 *
 * Tests login/logout functionality and authentication guards.
 * NOTE: User registration tests skipped until test database is available.
 */

import { expect, test } from '@playwright/test';
import { TEST_USERS } from './fixtures/test-users';
import {
	loginAs,
	logout,
	expectAuthenticated,
	expectUnauthenticated,
	clearAuth
} from './helpers/auth';

test.describe('Authentication', () => {
	// Clear auth state before each test
	test.beforeEach(async ({ page }) => {
		await clearAuth(page);
	});

	test('user can login with valid credentials', async ({ page }) => {
		// Use cyclist1 test user
		await loginAs(page, TEST_USERS.cyclist1);

		// Verify we're on the account page (cyclists redirect to /account)
		await expect(page).toHaveURL('/account');

		// Verify authenticated state in header
		await expectAuthenticated(page);
	});

	test('login shows error for invalid credentials', async ({ page }) => {
		// Navigate to login page
		await page.goto('/login');

		// Wait for form
		await page.waitForSelector('form');

		// Fill in invalid credentials
		await page.fill('#email', 'invalid@example.com');
		await page.fill('#password', 'wrongpassword');

		// Submit form
		await page.getByRole('button', { name: /iniciar sesión|log in/i }).click();

		// Wait a bit for response
		await page.waitForTimeout(1000);

		// Verify error message is displayed (Spanish/English error message from global alert or inline)
		const errorMessage = page.getByText(
			/Email o contraseña incorrectos|Invalid email or password/i
		);
		await expect(errorMessage).toBeVisible({ timeout: 5000 });

		// Verify still not authenticated
		await expectUnauthenticated(page);
	});

	test('authenticated user can access account', async ({ page }) => {
		// Login first
		await loginAs(page, TEST_USERS.cyclist1);

		// Navigate to account (cyclists go to /account)
		await page.goto('/account');

		// Should be able to access account
		await expect(page).toHaveURL('/account');

		// Verify account content is visible (not redirected)
		await expect(page.locator('h1, h2').first()).toBeVisible();

		// Verify authenticated state
		await expectAuthenticated(page);
	});

	test('unauthenticated user redirects to login from account', async ({ page }) => {
		// Ensure we're logged out
		await clearAuth(page);

		// Try to access account without authentication
		await page.goto('/account');

		// Should redirect to login page
		await expect(page).toHaveURL('/login');

		// Verify login form is visible
		await expect(page.getByRole('heading', { name: /iniciar sesión|log in/i })).toBeVisible();

		// Verify not authenticated
		await expectUnauthenticated(page);
	});

	test('user can logout successfully', async ({ page }) => {
		// Login first
		await loginAs(page, TEST_USERS.cyclist1);
		await expectAuthenticated(page);

		// Logout
		await logout(page);

		// Should be redirected to home or login
		await expect(page).toHaveURL(/\/(login)?$/);

		// Verify logged out state
		await expectUnauthenticated(page);

		// Try to access account again - should redirect to login
		await page.goto('/account');
		await expect(page).toHaveURL('/login');
	});

	test('authenticated user redirects from login to account', async ({ page }) => {
		// Login first
		await loginAs(page, TEST_USERS.cyclist1);

		// Try to access login page while authenticated
		await page.goto('/login');

		// Should redirect to account (for cyclists)
		await expect(page).toHaveURL('/account');

		// Verify still authenticated
		await expectAuthenticated(page);
	});
});

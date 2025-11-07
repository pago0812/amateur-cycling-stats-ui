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

		// Verify we're on the portal page
		await expect(page).toHaveURL('/portal');

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

		// Verify error message is displayed (Spanish error message from global alert or inline)
		const errorMessage = page.getByText(
			/email o contraseña incorrectos|invalid.*credentials|credenciales.*inválidas/i
		);
		await expect(errorMessage).toBeVisible({ timeout: 5000 });

		// Verify still not authenticated
		await expectUnauthenticated(page);
	});

	test('authenticated user can access portal', async ({ page }) => {
		// Login first
		await loginAs(page, TEST_USERS.cyclist1);

		// Navigate to portal
		await page.goto('/portal');

		// Should be able to access portal
		await expect(page).toHaveURL('/portal');

		// Verify portal content is visible (not redirected)
		await expect(page.locator('h2, h3')).toBeVisible();

		// Verify authenticated state
		await expectAuthenticated(page);
	});

	test('unauthenticated user redirects to login from portal', async ({ page }) => {
		// Ensure we're logged out
		await clearAuth(page);

		// Try to access portal without authentication
		await page.goto('/portal');

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

		// Try to access portal again - should redirect to login
		await page.goto('/portal');
		await expect(page).toHaveURL('/login');
	});

	test('authenticated user redirects from login to portal', async ({ page }) => {
		// Login first
		await loginAs(page, TEST_USERS.cyclist1);

		// Try to access login page while authenticated
		await page.goto('/login');

		// Should redirect to portal
		await expect(page).toHaveURL('/portal');

		// Verify still authenticated
		await expectAuthenticated(page);
	});
});

/**
 * E2E Tests: Portal Flows
 *
 * Tests portal access and logout functionality.
 * NOTE: Onboarding tests skipped until test database is available for user creation.
 */

import { expect, test } from '@playwright/test';
import { TEST_USERS } from './fixtures/test-users';
import { loginAs, logout, clearAuth, expectUnauthenticated } from './helpers/auth';
import { goToPortal } from './helpers/navigation';

test.describe('Portal', () => {
	// Clear auth before each test
	test.beforeEach(async ({ page }) => {
		await clearAuth(page);
	});

	test('authenticated user (with role) sees portal dashboard', async ({ page }) => {
		// Login as cyclist1 (has CYCLIST role from seed data)
		await loginAs(page, TEST_USERS.cyclist1);

		// Navigate to portal
		await goToPortal(page);

		// Verify on portal page
		await expect(page).toHaveURL('/portal');

		// Verify portal content is visible
		// Since user has a role, should NOT see onboarding
		// Should see portal dashboard content instead
		const hasHeading = await page.locator('h1, h2, h3').isVisible().catch(() => false);
		expect(hasHeading).toBeTruthy();

		// Verify logout button exists
		const logoutButton = page.getByRole('button', { name: /cerrar sesión|log out/i });
		await expect(logoutButton).toBeVisible();
	});

	test('user can logout successfully', async ({ page }) => {
		// Login first
		await loginAs(page, TEST_USERS.cyclist1);

		// Go to portal
		await goToPortal(page);

		// Click logout button
		await logout(page);

		// Verify logged out
		await expectUnauthenticated(page);

		// Verify redirected away from portal
		const currentURL = page.url();
		expect(currentURL).not.toContain('/portal');

		// Try to access portal again - should redirect to login
		await page.goto('/portal');
		await expect(page).toHaveURL('/login');
	});

	// TODO: Add onboarding tests when test database is available
	// - New user sees onboarding on first portal visit
	// - User can select cyclist role
	// - User can select organizer role
});

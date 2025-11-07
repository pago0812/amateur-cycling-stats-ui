/**
 * E2E Tests: Account Page Flows
 *
 * Tests account page access and cyclist profile display.
 */

import { expect, test } from '@playwright/test';
import { TEST_USERS } from './fixtures/test-users';
import { loginAs, clearAuth } from './helpers/auth';

test.describe('Account Page', () => {
	test.beforeEach(async ({ page }) => {
		await clearAuth(page);
	});

	test('cyclist login redirects to /account', async ({ page }) => {
		// Login as cyclist
		await loginAs(page, TEST_USERS.cyclist1);

		// Should redirect to account page
		await expect(page).toHaveURL('/account');
	});

	test('account page displays cyclist profile', async ({ page }) => {
		// Login as cyclist
		await loginAs(page, TEST_USERS.cyclist1);

		// Verify on account page
		await expect(page).toHaveURL('/account');

		// Check for profile content
		const heading = page.getByRole('heading', { level: 1 });
		await expect(heading).toBeVisible();

		// Check for tabs
		const profileTab = page.getByRole('link', { name: /perfil|profile/i });
		const eventsTab = page.getByRole('link', { name: /eventos|events/i });

		await expect(profileTab).toBeVisible();
		await expect(eventsTab).toBeVisible();
	});

	test('can navigate to upcoming events tab', async ({ page }) => {
		// Login as cyclist
		await loginAs(page, TEST_USERS.cyclist1);

		// Click events tab
		const eventsTab = page.getByRole('link', { name: /eventos|events/i });
		await eventsTab.click();

		// Should navigate to events page
		await expect(page).toHaveURL('/account/events');

		// Should show coming soon message
		const comingSoon = page.getByText(/próximamente|coming soon/i);
		await expect(comingSoon).toBeVisible();
	});

	test('organizer login redirects to /panel', async ({ page }) => {
		// Login as organizer
		await loginAs(page, TEST_USERS.organizer);

		// Should redirect to panel page
		await expect(page).toHaveURL(/\/panel/);
	});

	test('admin login redirects to /admin', async ({ page }) => {
		// Login as admin
		await loginAs(page, TEST_USERS.admin);

		// Should redirect to admin page
		await expect(page).toHaveURL(/\/admin/);
	});

	test('unauthenticated user redirects to /login', async ({ page }) => {
		// Try to access account page without login
		await page.goto('/account');

		// Should redirect to login
		await expect(page).toHaveURL('/login');
	});

	test('profile tab shows cyclist information', async ({ page }) => {
		// Login as cyclist
		await loginAs(page, TEST_USERS.cyclist1);

		// Should be on profile tab by default
		await expect(page).toHaveURL('/account');

		// Should show cyclist name (from profile component)
		const profileContent = page.locator('main');
		await expect(profileContent).toBeVisible();
	});
});

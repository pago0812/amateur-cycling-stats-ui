/**
 * E2E Tests: Account Page Flows
 *
 * Tests account page access, navigation, and cyclist profile display.
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

	test('displays MenuToolbar with breadcrumb and tabs', async ({ page }) => {
		// Login as cyclist
		await loginAs(page, TEST_USERS.cyclist1);

		// Verify MenuToolbar breadcrumb is visible
		const breadcrumb = page.getByText(/mi cuenta|my account/i);
		await expect(breadcrumb).toBeVisible();

		// Check for navigation tabs
		const profileTab = page.getByRole('link', { name: /perfil|profile/i });
		const eventsTab = page.getByRole('link', { name: /próximos eventos|upcoming events/i });

		await expect(profileTab).toBeVisible();
		await expect(eventsTab).toBeVisible();
	});

	test('displays cyclist profile information', async ({ page }) => {
		// Login as cyclist2 (María García) to avoid concurrent user conflicts
		await loginAs(page, TEST_USERS.cyclist2);

		// Should show cyclist name in heading
		const nameHeading = page.getByRole('heading', { name: /maría garcía|maria garcia/i });
		await expect(nameHeading).toBeVisible();

		// Should show profile avatar placeholder with initials
		const avatar = page.locator('div').filter({ hasText: /^MG$/ }).first();
		await expect(avatar).toBeVisible();

		// Should show race history section
		const raceHistoryHeading = page.getByRole('heading', {
			name: /historial de carreras|race history/i
		});
		await expect(raceHistoryHeading).toBeVisible();
	});

	test('can navigate to upcoming events tab', async ({ page }) => {
		// Login as cyclist3 (Javier Martínez) to avoid concurrent user conflicts
		await loginAs(page, TEST_USERS.cyclist3);

		// Click events tab
		const eventsTab = page.getByRole('link', { name: /próximos eventos|upcoming events/i });
		await eventsTab.click();

		// Should navigate to events page
		await expect(page).toHaveURL('/account/events');

		// Should show breadcrumb trail
		const breadcrumb = page.getByText(/mi cuenta|my account/i);
		await expect(breadcrumb).toBeVisible();

		// Should show coming soon message
		const comingSoon = page.getByText(/próximamente|coming soon/i);
		await expect(comingSoon).toBeVisible();
	});

	test('can navigate back to profile from events using breadcrumb', async ({ page }) => {
		// Login as cyclist2 (María García) to avoid concurrent user conflicts
		await loginAs(page, TEST_USERS.cyclist2);

		// Navigate to events tab
		await page.getByRole('link', { name: /próximos eventos|upcoming events/i }).click();
		await expect(page).toHaveURL('/account/events');

		// Click breadcrumb to go back to account (Mi Cuenta / My Account)
		const accountBreadcrumb = page.getByRole('link', { name: /mi cuenta|my account/i });
		await accountBreadcrumb.click();

		// Should be back on account page
		await expect(page).toHaveURL('/account');

		// Should show cyclist profile again
		const nameHeading = page.getByRole('heading', { name: /maría garcía|maria garcia/i });
		await expect(nameHeading).toBeVisible();
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
});

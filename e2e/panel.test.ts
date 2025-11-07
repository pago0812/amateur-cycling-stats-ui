/**
 * E2E Tests: Panel Page Flows
 *
 * Tests panel page access and role-based navigation.
 */

import { expect, test } from '@playwright/test';
import { TEST_USERS } from './fixtures/test-users';
import { loginAs, clearAuth } from './helpers/auth';

test.describe('Panel Page', () => {
	test.beforeEach(async ({ page }) => {
		await clearAuth(page);
	});

	test('organizer login redirects to /panel', async ({ page }) => {
		// Login as organizer
		await loginAs(page, TEST_USERS.organizer);

		// Should redirect to panel organization page
		await expect(page).toHaveURL(/\/panel/);
	});

	test('organizer sees 3 tabs', async ({ page }) => {
		// Login as organizer
		await loginAs(page, TEST_USERS.organizer);

		// Check for tabs
		const overviewTab = page.getByRole('link', { name: /resumen|overview/i });
		const eventsTab = page.getByRole('link', { name: /eventos|events/i });
		const organizersTab = page.getByRole('link', { name: /organizadores|organizers/i });

		await expect(overviewTab).toBeVisible();
		await expect(eventsTab).toBeVisible();
		await expect(organizersTab).toBeVisible();
	});

	test('admin login redirects to /admin (not /panel)', async ({ page }) => {
		// Login as admin
		await loginAs(page, TEST_USERS.admin);

		// Should redirect to admin page, not panel
		await expect(page).toHaveURL(/\/admin/);
	});

	test('can navigate between panel sections', async ({ page }) => {
		// Login as organizer
		await loginAs(page, TEST_USERS.organizer);

		// Click events tab
		const eventsTab = page.getByRole('link', { name: /eventos|events/i });
		await eventsTab.click();
		await expect(page).toHaveURL('/panel/events');

		// Click organizers tab
		const organizersTab = page.getByRole('link', { name: /organizadores|organizers/i });
		await organizersTab.click();
		await expect(page).toHaveURL('/panel/organizers');

		// Click overview tab
		const overviewTab = page.getByRole('link', { name: /resumen|overview/i });
		await overviewTab.click();
		await expect(page).toHaveURL('/panel');
	});

	test('panel sections show placeholder content', async ({ page }) => {
		// Login as organizer
		await loginAs(page, TEST_USERS.organizer);

		// Should show coming soon message
		const comingSoon = page.getByText(/próximamente|coming soon/i);
		await expect(comingSoon).toBeVisible();
	});

	test('cyclist login redirects to /account', async ({ page }) => {
		// Login as cyclist
		await loginAs(page, TEST_USERS.cyclist1);

		// Should redirect to account page
		await expect(page).toHaveURL('/account');
	});

	test('unauthenticated user redirects to /login', async ({ page }) => {
		// Try to access panel page without login
		await page.goto('/panel');

		// Should redirect to login
		await expect(page).toHaveURL('/login');
	});

	test('admin trying to access /panel redirects to /admin', async ({ page }) => {
		// Login as admin
		await loginAs(page, TEST_USERS.admin);

		// Try to access panel page directly
		await page.goto('/panel');

		// Should redirect to admin page
		await expect(page).toHaveURL('/admin');
	});
});

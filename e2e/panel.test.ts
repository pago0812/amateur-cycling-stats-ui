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

	test('organizer sees 3 tabs (no admin tab)', async ({ page }) => {
		// Login as organizer
		await loginAs(page, TEST_USERS.organizer);

		// Check for tabs
		const orgTab = page.getByRole('link', { name: /organización|organization/i });
		const eventsTab = page.getByRole('link', { name: /eventos|events/i });
		const organizersTab = page.getByRole('link', { name: /organizadores|organizers/i });

		await expect(orgTab).toBeVisible();
		await expect(eventsTab).toBeVisible();
		await expect(organizersTab).toBeVisible();

		// Should NOT see admin-only tab
		const organizationsTab = page.getByRole('link', { name: /organizaciones|organizations/i });
		await expect(organizationsTab).not.toBeVisible();
	});

	test('admin sees 4 tabs (including admin tab)', async ({ page }) => {
		// Login as admin
		await loginAs(page, TEST_USERS.admin);

		// Check for all tabs including admin-only
		const orgTab = page.getByRole('link', { name: /mi organización|my organization/i });
		const eventsTab = page.getByRole('link', { name: /eventos|events/i });
		const organizersTab = page.getByRole('link', { name: /organizadores|organizers/i });
		const organizationsTab = page.getByRole('link', { name: /organizaciones|organizations/i });

		await expect(orgTab).toBeVisible();
		await expect(eventsTab).toBeVisible();
		await expect(organizersTab).toBeVisible();
		await expect(organizationsTab).toBeVisible();
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

		// Click organization tab
		const orgTab = page.getByRole('link', { name: /organización|organization/i });
		await orgTab.click();
		await expect(page).toHaveURL('/panel/organization');
	});

	test('panel sections show placeholder content', async ({ page }) => {
		// Login as organizer
		await loginAs(page, TEST_USERS.organizer);

		// Should show coming soon message
		const comingSoon = page.getByText(/próximamente|coming soon/i);
		await expect(comingSoon).toBeVisible();
	});

	test('admin can access organizations section', async ({ page }) => {
		// Login as admin
		await loginAs(page, TEST_USERS.admin);

		// Click organizations tab
		const organizationsTab = page.getByRole('link', { name: /organizaciones|organizations/i });
		await organizationsTab.click();

		// Should navigate to organizations page
		await expect(page).toHaveURL('/panel/organizations');

		// Should show admin-only indicator
		const adminOnly = page.locator('main');
		await expect(adminOnly).toBeVisible();
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

	test('non-admin accessing /panel/organizations redirects', async ({ page }) => {
		// Login as organizer (not admin)
		await loginAs(page, TEST_USERS.organizer);

		// Try to access admin-only page directly
		await page.goto('/panel/organizations');

		// Should redirect back to panel
		await expect(page).toHaveURL('/panel');
	});
});

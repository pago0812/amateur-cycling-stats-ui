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

	test('displays MenuToolbar with breadcrumb and tabs', async ({ page }) => {
		// Login as organizer
		await loginAs(page, TEST_USERS.organizer);

		// Verify MenuToolbar breadcrumb is visible
		const breadcrumb = page.getByText(/panel del organizador|organizator panel/i);
		await expect(breadcrumb).toBeVisible();

		// Check for navigation tabs (Summary and Organization)
		const summaryTab = page.getByRole('link', { name: /resumen|summary/i });
		const organizationTab = page.getByRole('link', { name: /organización|organization/i });

		await expect(summaryTab).toBeVisible();
		await expect(organizationTab).toBeVisible();
	});

	test('admin login redirects to /admin (not /panel)', async ({ page }) => {
		// Login as admin
		await loginAs(page, TEST_USERS.admin);

		// Should redirect to admin page, not panel
		await expect(page).toHaveURL(/\/admin/);
	});

	test('can navigate between panel sections using breadcrumbs', async ({ page }) => {
		// Login as organizer
		await loginAs(page, TEST_USERS.organizer);

		// Click organization tab
		const organizationTab = page.getByRole('link', { name: /organización|organization/i });
		await organizationTab.click();
		await expect(page).toHaveURL('/panel/organization');

		// Should show breadcrumb trail with clickable panel link
		const panelBreadcrumb = page.getByRole('link', {
			name: /panel del organizador|organizator panel/i
		});
		await expect(panelBreadcrumb).toBeVisible();

		// Click panel breadcrumb to go back to summary
		await panelBreadcrumb.click();
		await expect(page).toHaveURL('/panel');

		// Should show coming soon message again
		const comingSoon = page.getByText(/próximamente|coming soon/i);
		await expect(comingSoon).toBeVisible();
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

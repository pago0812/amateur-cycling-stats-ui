/**
 * E2E Tests: Admin Page Flows
 *
 * Tests admin page access, navigation, and role-based restrictions.
 */

import { expect, test } from '@playwright/test';
import { TEST_USERS } from './fixtures/test-users';
import { loginAs, clearAuth } from './helpers/auth';

test.describe('Admin Page', () => {
	test.beforeEach(async ({ page }) => {
		await clearAuth(page);
	});

	test('admin login redirects to /admin', async ({ page }) => {
		// Login as admin
		await loginAs(page, TEST_USERS.admin);

		// Should redirect to admin page
		await expect(page).toHaveURL(/\/admin/);
	});

	test('displays MenuToolbar with breadcrumb and tabs', async ({ page }) => {
		// Login as admin
		await loginAs(page, TEST_USERS.admin);

		// Verify MenuToolbar breadcrumb is visible
		const breadcrumb = page.getByText(/panel de administración|admin panel/i);
		await expect(breadcrumb).toBeVisible();

		// Check for navigation tabs
		const summaryTab = page.getByRole('link', { name: /resumen|summary/i });
		const organizationsTab = page.getByRole('link', { name: /organizaciones|organizations/i });

		await expect(summaryTab).toBeVisible();
		await expect(organizationsTab).toBeVisible();
	});

	test('admin page shows placeholder content', async ({ page }) => {
		// Login as admin
		await loginAs(page, TEST_USERS.admin);

		// Should show coming soon message
		const comingSoon = page.getByText(/próximamente|coming soon/i);
		await expect(comingSoon).toBeVisible();
	});

	test('cyclist cannot access /admin', async ({ page }) => {
		// Login as cyclist
		await loginAs(page, TEST_USERS.cyclist1);

		// Try to access admin page directly
		await page.goto('/admin');

		// Should redirect to account page
		await expect(page).toHaveURL('/account');
	});

	test('organizer staff cannot access /admin', async ({ page }) => {
		// Login as organizer staff
		await loginAs(page, TEST_USERS.staff);

		// Try to access admin page directly
		await page.goto('/admin');

		// Should redirect to panel
		await expect(page).toHaveURL('/panel');
	});

	test('organizer admin cannot access /admin', async ({ page }) => {
		// Login as organizer admin
		await loginAs(page, TEST_USERS.organizer);

		// Try to access admin page directly
		await page.goto('/admin');

		// Should redirect to panel
		await expect(page).toHaveURL('/panel');
	});

	test('unauthenticated user redirects to /login', async ({ page }) => {
		// Try to access admin page without login
		await page.goto('/admin');

		// Should redirect to login
		await expect(page).toHaveURL('/login');
	});

	test('can navigate to organizations tab', async ({ page }) => {
		// Login as admin
		await loginAs(page, TEST_USERS.admin);

		// Click organizations tab
		const organizationsTab = page.getByRole('link', { name: /organizaciones|organizations/i });
		await organizationsTab.click();

		// Should navigate to organizations page
		await expect(page).toHaveURL('/admin/organizations');

		// Should show breadcrumb trail
		const breadcrumb = page.getByText(/panel de administración|admin panel/i);
		await expect(breadcrumb).toBeVisible();

		// Should show Add Organization button
		const addButton = page.getByRole('button', {
			name: /añadir organización|add organization/i
		});
		await expect(addButton).toBeVisible();
	});

	test('can navigate back to summary from organizations using breadcrumb', async ({ page }) => {
		// Login as admin
		await loginAs(page, TEST_USERS.admin);

		// Navigate to organizations tab
		await page.getByRole('link', { name: /organizaciones|organizations/i }).click();
		await expect(page).toHaveURL('/admin/organizations');

		// Click breadcrumb to go back to admin (Admin Panel)
		const adminBreadcrumb = page.getByRole('link', { name: /panel de administración|admin panel/i });
		await adminBreadcrumb.click();

		// Should be back on admin summary page
		await expect(page).toHaveURL('/admin');

		// Should show coming soon message again
		const comingSoon = page.getByText(/próximamente|coming soon/i);
		await expect(comingSoon).toBeVisible();
	});
});

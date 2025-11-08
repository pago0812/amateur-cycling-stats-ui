/**
 * E2E Tests: Admin Page Flows
 *
 * Tests admin page access and role-based restrictions.
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

	test('admin sees General Config tab', async ({ page }) => {
		// Login as admin
		await loginAs(page, TEST_USERS.admin);

		// Check for General Config tab
		const configTab = page.getByRole('link', { name: /configuración general|general config/i });
		await expect(configTab).toBeVisible();
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

	test('admin page has correct title and subtitle', async ({ page }) => {
		// Login as admin
		await loginAs(page, TEST_USERS.admin);

		// Check for title
		const title = page.getByRole('heading', {
			name: /Panel de Administración|Admin Panel/i
		});
		await expect(title).toBeVisible();

		// Check for subtitle
		const subtitle = page.getByText(
			/Gestiona la configuración y ajustes del sistema|System settings and configuration/i
		);
		await expect(subtitle).toBeVisible();
	});
});

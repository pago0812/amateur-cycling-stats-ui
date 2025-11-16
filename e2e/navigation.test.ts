/**
 * E2E Tests: Navigation and Error Handling
 *
 * Tests navigation flows and error states.
 */

import { expect, test } from '@playwright/test';
import { goToHome, goToResults } from './helpers/navigation';
import { loginAs, clearAuth } from './helpers/auth';
import { TEST_USERS } from './fixtures/test-users';

test.describe('Navigation', () => {
	test.beforeEach(async ({ page }) => {
		await clearAuth(page);
	});

	test('header navigation links work correctly', async ({ page }) => {
		// Start at home
		await goToHome(page);

		// Verify home button in header (Button component renders as <a role="button">)
		const homeButton = page
			.getByRole('navigation')
			.getByRole('button', { name: /inicio|home/i })
			.first();
		await expect(homeButton).toBeVisible();

		// Click Results button
		const resultsButton = page
			.getByRole('navigation')
			.getByRole('button', { name: /resultados|results/i })
			.first();
		await resultsButton.click();
		await expect(page).toHaveURL(/\/results/);

		// Click Home button to go back
		await homeButton.click();
		await expect(page).toHaveURL('/');

		// Verify login button exists when not authenticated (Button component)
		const loginButton = page
			.getByRole('navigation')
			.getByRole('button', { name: /iniciar sesión|log in/i });
		await expect(loginButton).toBeVisible();
	});

	test('event card links to event detail page', async ({ page }) => {
		// Go to results page
		await goToResults(page);

		// Find first event link
		const eventLink = page
			.getByRole('link')
			.filter({ hasText: /fondo|challenge|criterium|climb/i })
			.first();
		const eventsCount = await page
			.getByRole('link')
			.filter({ hasText: /fondo|challenge|criterium|climb/i })
			.count();

		if (eventsCount === 0) {
			test.skip(); // No events available
			return;
		}

		// Get event name before clicking
		const eventName = await eventLink.textContent();

		// Click event link
		await eventLink.click();

		// Verify navigated to event detail page
		await expect(page).toHaveURL(/\/results\/[a-f0-9-]+/);

		// Verify event detail page loaded
		await expect(page.locator('h2')).toBeVisible();

		if (eventName) {
			// Verify event name appears on detail page
			const pageContent = await page.textContent('body');
			expect(pageContent).toContain(eventName.trim());
		}
	});

	test('cyclist link in results navigates to profile', async ({ page }) => {
		// Go to results page
		await goToResults(page);

		// Find and click first event
		const eventLink = page
			.getByRole('link')
			.filter({ hasText: /fondo|challenge|criterium|climb/i })
			.first();
		const eventsCount = await page
			.getByRole('link')
			.filter({ hasText: /fondo|challenge|criterium|climb/i })
			.count();

		if (eventsCount === 0) {
			test.skip();
			return;
		}

		await eventLink.click();
		await page.waitForURL(/\/results\/.+/);
		await page.waitForLoadState('networkidle');

		// Check if results table exists
		const hasTable = await page
			.locator('table')
			.isVisible()
			.catch(() => false);

		if (!hasTable) {
			test.skip(); // No results available
			return;
		}

		// Find first cyclist link in table
		const cyclistLink = page.locator('table').getByRole('link').first();
		await expect(cyclistLink).toBeVisible();

		const cyclistNameFromTable = await cyclistLink.textContent();

		// Click cyclist link
		await cyclistLink.click();

		// Verify navigated to cyclist profile page
		await expect(page).toHaveURL(/\/cyclists\/[a-f0-9-]+/);

		// Verify cyclist profile loaded with heading
		const heading = page.locator('h2');
		await expect(heading).toBeVisible();

		// Verify name components appear in heading
		// Note: Results table shows "lastName firstName" but profile shows "firstName lastName"
		if (cyclistNameFromTable) {
			const nameParts = cyclistNameFromTable
				.trim()
				.split(/\s+/)
				.filter((part) => part.length > 0);
			const headingText = await heading.textContent();

			// Check that at least one name part appears in the heading
			const hasNamePart = nameParts.some((part) =>
				headingText?.toLowerCase().includes(part.toLowerCase())
			);
			expect(hasNamePart).toBeTruthy();
		}
	});

	test('non-existent event shows error or 404', async ({ page }) => {
		// Navigate to non-existent event (UUID format)
		await page.goto('/results/nonexist99');

		// Wait for page to load
		await page.waitForLoadState('networkidle');

		// Should show 404 error page with custom error UI
		// Check for 404 heading
		const has404Heading = await page
			.getByRole('heading', { name: '404' })
			.isVisible()
			.catch(() => false);

		// Check for error message (in English or Spanish)
		const hasErrorMessage = await page
			.getByText(/event not found|evento no encontrado/i)
			.isVisible()
			.catch(() => false);

		// Should have both 404 heading and error message
		expect(has404Heading).toBeTruthy();
		expect(hasErrorMessage).toBeTruthy();
	});

	test('global alert displays error messages', async ({ page }) => {
		// Trigger an error by attempting login with invalid credentials
		await page.goto('/login');

		// Wait for email input to be visible (more specific than waiting for form)
		await page.waitForSelector('#email', { state: 'visible' });

		await page.fill('#email', 'invalid@example.com');
		await page.fill('#password', 'wrongpassword');

		// Submit form - use main area to avoid header button
		await page
			.getByRole('main')
			.getByRole('button', { name: /iniciar sesión|log in/i })
			.click();

		// Wait for error message
		await page.waitForTimeout(1000);

		// Verify error message is displayed (matches i18n auth error messages)
		const errorMessage = page.getByText(
			/Email o contraseña incorrectos|Invalid email or password/i
		);
		await expect(errorMessage).toBeVisible({ timeout: 5000 });

		// This demonstrates that error messages are shown to users
		// Whether via global alert component or inline form errors
	});

	test('authenticated user sees account link in header', async ({ page }) => {
		// Login as test user
		await loginAs(page, TEST_USERS.cyclist1);

		// Go to home page
		await goToHome(page);

		// Verify account button is visible (Button component renders as <a role="button">)
		const accountButton = page.getByRole('navigation').getByRole('button', { name: /account/i });
		await expect(accountButton).toBeVisible();

		// Verify login button is NOT visible
		const loginButton = page.getByRole('navigation').getByRole('button', { name: /log in/i });
		await expect(loginButton).not.toBeVisible();

		// Click account button should navigate to account page (for cyclists)
		await accountButton.click();
		await expect(page).toHaveURL('/account');
	});
});

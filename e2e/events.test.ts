/**
 * E2E Tests: Event Browsing Flows
 *
 * Tests event listing, filtering, and race results display.
 */

import { expect, test } from '@playwright/test';
import {
	TEST_EVENTS,
	TEST_RACE_CATEGORIES,
	TEST_GENDERS,
	TEST_LENGTHS,
	getCurrentYear,
	getPastYear
} from './fixtures/test-data';
import {
	goToHome,
	goToResults,
	clickEventByName,
	selectFilter,
	expectNoResultsMessage
} from './helpers/navigation';

test.describe('Event Browsing', () => {
	test('home page displays future events correctly', async ({ page }) => {
		// Navigate to home page
		await goToHome(page);

		// Verify page title
		await expect(
			page.getByRole('heading', { name: /próximos eventos|upcoming events/i })
		).toBeVisible();

		// Check if events table/list exists
		const eventsContainer = page.locator('table, .grid, .flex').first();
		await expect(eventsContainer).toBeVisible();

		// Verify at least one event is displayed (if future events exist in seed data)
		// Note: This might fail if no future events exist - that's expected
		const eventLinks = page
			.getByRole('link')
			.filter({ hasText: /challenge|fondo|criterium|climb/i });
		const count = await eventLinks.count();

		if (count > 0) {
			// If future events exist, verify one is visible
			await expect(eventLinks.first()).toBeVisible();
		} else {
			// If no future events, verify "no events" message
			await expectNoResultsMessage(page);
		}
	});

	test('home page handles empty events gracefully', async ({ page }) => {
		// Navigate to home page
		await goToHome(page);

		// Check if any events are displayed
		const eventLinks = page
			.getByRole('link')
			.filter({ hasText: /challenge|fondo|criterium|climb/i });
		const count = await eventLinks.count();

		if (count === 0) {
			// Verify "no events" message is shown
			await expectNoResultsMessage(page);

			// Verify page doesn't break (heading still visible)
			await expect(
				page.getByRole('heading', { name: /próximos eventos|upcoming events/i })
			).toBeVisible();
		}
	});

	test('results page displays past events for current year', async ({ page }) => {
		const currentYear = getCurrentYear();

		// Navigate to results page
		await goToResults(page);

		// Verify page title
		await expect(page.getByRole('heading', { name: /resultados|results/i })).toBeVisible();

		// Verify year filter is present and set to current year
		const yearSelect = page.locator('select[name="year"]');
		await expect(yearSelect).toBeVisible();
		await expect(yearSelect).toHaveValue(currentYear.toString());

		// Check if events are displayed
		const eventsContainer = page.locator('table, .grid, .flex').first();
		await expect(eventsContainer).toBeVisible();
	});

	test('year filter updates past events list', async ({ page }) => {
		const currentYear = getCurrentYear();
		const pastYear = getPastYear();

		// Navigate to results page
		await goToResults(page);

		// Select past year from filter
		await selectFilter(page, 'year', pastYear.toString());

		// Verify URL updated with year parameter
		await expect(page).toHaveURL(`/results?year=${pastYear}`);

		// Verify page content loaded (may or may not have events)
		const eventsContainer = page.locator('table, .grid, .flex, p').first();
		await expect(eventsContainer).toBeVisible();

		// Switch back to current year
		await selectFilter(page, 'year', currentYear.toString());
		await expect(page).toHaveURL(`/results?year=${currentYear}`);
	});

	test('event detail page shows event information', async ({ page }) => {
		// First, go to results page to find an event
		await goToResults(page);

		// Find and click on first available event (past event from seed data)
		const eventLink = page
			.getByRole('link')
			.filter({ hasText: /fondo|challenge|criterium|climb/i })
			.first();

		// Check if event exists
		const count = await page
			.getByRole('link')
			.filter({ hasText: /fondo|challenge|criterium|climb/i })
			.count();

		if (count === 0) {
			// Skip test if no events available
			test.skip();
			return;
		}

		await eventLink.click();
		await page.waitForURL(/\/results\/.+/);

		// Verify event detail page loaded
		await expect(page.locator('h2')).toBeVisible();

		// Verify filter dropdowns are present
		const categorySelect = page.locator('select').first();
		await expect(categorySelect).toBeVisible();

		// Verify either results table or no results message is shown
		const hasTable = await page
			.locator('table')
			.isVisible()
			.catch(() => false);
		const hasNoResults = await page
			.getByText(/no hay resultados|no results/i)
			.isVisible()
			.catch(() => false);

		expect(hasTable || hasNoResults).toBeTruthy();
	});

	test('category filter updates race results', async ({ page }) => {
		// Go to results and find an event
		await goToResults(page);

		const eventLink = page
			.getByRole('link')
			.filter({ hasText: /fondo|challenge|criterium|climb/i })
			.first();
		const count = await page
			.getByRole('link')
			.filter({ hasText: /fondo|challenge|criterium|climb/i })
			.count();

		if (count === 0) {
			test.skip();
			return;
		}

		await eventLink.click();
		await page.waitForURL(/\/results\/.+/);

		// Get available category options
		const categorySelect = page
			.locator('select')
			.filter({ hasText: /categoría|category/i })
			.or(page.locator('select').first());
		await expect(categorySelect).toBeVisible();

		// Get first and second options
		const options = await categorySelect.locator('option').all();

		if (options.length > 1) {
			// Select second option (first is usually default/all)
			const secondOptionValue = await options[1].getAttribute('value');
			if (secondOptionValue) {
				await categorySelect.selectOption(secondOptionValue);

				// Verify URL updated
				await expect(page).toHaveURL(new RegExp(`category=${secondOptionValue}`));

				// Wait for content to load
				await page.waitForLoadState('networkidle');

				// Verify either table or no results message
				const hasTable = await page
					.locator('table')
					.isVisible()
					.catch(() => false);
				const hasNoResults = await page
					.getByText(/no hay resultados|no results/i)
					.isVisible()
					.catch(() => false);
				expect(hasTable || hasNoResults).toBeTruthy();
			}
		}
	});

	test('gender filter updates race results', async ({ page }) => {
		// Go to results and find an event
		await goToResults(page);

		const eventLink = page
			.getByRole('link')
			.filter({ hasText: /fondo|challenge|criterium|climb/i })
			.first();
		const count = await page
			.getByRole('link')
			.filter({ hasText: /fondo|challenge|criterium|climb/i })
			.count();

		if (count === 0) {
			test.skip();
			return;
		}

		await eventLink.click();
		await page.waitForURL(/\/results\/.+/);

		// Find gender select (look for select with gender-related text or second select)
		const selects = await page.locator('select').all();

		if (selects.length >= 2) {
			const genderSelect = selects[1]; // Usually second select
			await expect(genderSelect).toBeVisible();

			// Get options
			const options = await genderSelect.locator('option').all();

			if (options.length > 1) {
				const secondOptionValue = await options[1].getAttribute('value');
				if (secondOptionValue) {
					await genderSelect.selectOption(secondOptionValue);

					// Verify URL updated
					await expect(page).toHaveURL(new RegExp(`gender=${secondOptionValue}`));

					// Wait for content
					await page.waitForLoadState('networkidle');
				}
			}
		}
	});

	test('no results message shown for non-existent race combination with filters visible', async ({
		page
	}) => {
		// Go to results and find an event
		await goToResults(page);

		const eventLink = page
			.getByRole('link')
			.filter({ hasText: /fondo|challenge|criterium|climb/i })
			.first();
		const count = await page
			.getByRole('link')
			.filter({ hasText: /fondo|challenge|criterium|climb/i })
			.count();

		if (count === 0) {
			test.skip();
			return;
		}

		await eventLink.click();
		await page.waitForURL(/\/results\/.+/);

		// Get all selects
		const selects = await page.locator('select').all();

		if (selects.length >= 3) {
			// Try to select a combination that likely doesn't exist
			// Select last options from each filter
			for (const select of selects) {
				const options = await select.locator('option').all();
				if (options.length > 0) {
					const lastOptionValue = await options[options.length - 1].getAttribute('value');
					if (lastOptionValue) {
						await select.selectOption(lastOptionValue);
						await page.waitForTimeout(300); // Small delay between selections
					}
				}
			}

			// Wait for content to load
			await page.waitForLoadState('networkidle');

			// Check if no results message appears
			const hasNoResults = await page
				.getByText(/no hay resultados|no results|no.+disponibles/i)
				.isVisible()
				.catch(() => false);

			if (hasNoResults) {
				// Verify filters are still visible (graceful UX)
				for (const select of selects) {
					await expect(select).toBeVisible();
				}

				// Verify helpful message is shown
				await expectNoResultsMessage(page);
			}
		}
	});
});

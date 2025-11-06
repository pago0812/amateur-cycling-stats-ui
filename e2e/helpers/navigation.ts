/**
 * Navigation Helper Functions for E2E Tests
 *
 * Provides reusable functions for common navigation patterns.
 */

import { type Page, expect } from '@playwright/test';

/**
 * Navigate to home page and wait for it to load
 * @param page - Playwright page object
 */
export async function goToHome(page: Page) {
	await page.goto('/');
	await expect(page.locator('h2')).toBeVisible();
}

/**
 * Navigate to results page and wait for it to load
 * @param page - Playwright page object
 * @param year - Optional year filter
 */
export async function goToResults(page: Page, year?: number) {
	const url = year ? `/results?year=${year}` : '/results';
	await page.goto(url);
	await expect(page.locator('h2')).toBeVisible();
}

/**
 * Navigate to event detail page
 * @param page - Playwright page object
 * @param eventId - Event UUID
 */
export async function goToEventDetail(page: Page, eventId: string) {
	await page.goto(`/results/${eventId}`);
	await expect(page.locator('h2')).toBeVisible();
}

/**
 * Navigate to cyclist profile page
 * @param page - Playwright page object
 * @param cyclistId - Cyclist UUID
 */
export async function goToCyclistProfile(page: Page, cyclistId: string) {
	await page.goto(`/cyclists/${cyclistId}`);
	await expect(page.locator('h2')).toBeVisible();
}

/**
 * Navigate to portal page
 * @param page - Playwright page object
 */
export async function goToPortal(page: Page) {
	await page.goto('/portal');
	// Portal page might have different content based on user state
	await page.waitForLoadState('networkidle');
}

/**
 * Navigate to login page
 * @param page - Playwright page object
 */
export async function goToLogin(page: Page) {
	await page.goto('/login');
	await expect(page.getByRole('heading', { name: /iniciar sesión|log in/i })).toBeVisible();
}

/**
 * Click on an event card from home or results page
 * @param page - Playwright page object
 * @param eventName - Name of the event to click
 * @returns Event ID from the URL after navigation
 */
export async function clickEventByName(page: Page, eventName: string): Promise<string> {
	// Find event link by name
	const eventLink = page.getByRole('link', { name: new RegExp(eventName, 'i') });
	await expect(eventLink).toBeVisible();

	// Click and wait for navigation
	await eventLink.click();
	await page.waitForURL(/\/results\/.+/);

	// Extract event ID from URL
	const url = page.url();
	const match = url.match(/\/results\/([a-f0-9-]+)/);
	if (!match) throw new Error('Could not extract event ID from URL');

	return match[1];
}

/**
 * Click on a cyclist link from results table
 * @param page - Playwright page object
 * @param cyclistName - Name of the cyclist to click (first or last name)
 * @returns Cyclist ID from the URL after navigation
 */
export async function clickCyclistByName(page: Page, cyclistName: string): Promise<string> {
	// Find cyclist link in table
	const cyclistLink = page.getByRole('link', { name: new RegExp(cyclistName, 'i') }).first();
	await expect(cyclistLink).toBeVisible();

	// Click and wait for navigation
	await cyclistLink.click();
	await page.waitForURL(/\/cyclists\/.+/);

	// Extract cyclist ID from URL
	const url = page.url();
	const match = url.match(/\/cyclists\/([a-f0-9-]+)/);
	if (!match) throw new Error('Could not extract cyclist ID from URL');

	return match[1];
}

/**
 * Change URL query parameter filter
 * @param page - Playwright page object
 * @param filterName - Name of the filter (category, gender, length, year)
 * @param value - Value to select
 */
export async function selectFilter(page: Page, filterName: string, value: string) {
	// Find select element by label
	const select = page.locator(`select[name="${filterName}"]`);
	await expect(select).toBeVisible();

	// Select option and wait for URL to update
	await select.selectOption(value);
	await page.waitForURL(new RegExp(`[?&]${filterName}=${value}`));
}

/**
 * Wait for table to be visible and have rows
 * @param page - Playwright page object
 */
export async function waitForTableWithRows(page: Page) {
	await expect(page.locator('table')).toBeVisible();
	const rowCount = await page.locator('tbody tr').count();
	expect(rowCount).toBeGreaterThan(0);
}

/**
 * Check if "no results" message is displayed
 * @param page - Playwright page object
 */
export async function expectNoResultsMessage(page: Page) {
	const noResultsText = page.getByText(/no hay resultados|no results|no.+disponibles/i);
	await expect(noResultsText).toBeVisible();
}

import { expect, test } from '@playwright/test';

test('home page has expected heading', async ({ page }) => {
	await page.goto('/');
	// Check for h1 or h2 heading
	const heading = page.locator('h1, h2').first();
	await expect(heading).toBeVisible();
});

import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		reuseExistingServer: !process.env.CI
	},
	testDir: 'e2e',
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure'
	},
	// Increase timeout for slower CI environments
	timeout: 30 * 1000,
	// Retry failed tests once
	retries: process.env.CI ? 2 : 0,
	// Run tests in parallel
	workers: process.env.CI ? 1 : undefined
});

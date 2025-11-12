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
		screenshot: 'only-on-failure',
		// Ensure clean context per test - no shared storage state
		storageState: undefined
	},
	// Increase timeout for slower CI environments
	timeout: 30 * 1000,
	// Retry failed tests to handle auth flakiness from Supabase rate limiting
	retries: process.env.CI ? 2 : 1,
	// Run tests in parallel with explicit mode enabled
	fullyParallel: true,
	// Limit parallel workers to prevent resource contention with Supabase Auth API
	// Lower worker count helps avoid auth rate limiting and concurrent session conflicts
	workers: process.env.CI ? 1 : 2
});

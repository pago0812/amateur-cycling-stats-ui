# E2E Test Suite

This directory contains end-to-end tests for the Amateur Cycling Stats application using Playwright.

## Prerequisites

Before running E2E tests, you **MUST** seed the database with test users:

```bash
# 1. Reset the database (if needed)
supabase db reset --linked

# 2. Seed test users and data
npm run seed:users
```

This creates the following test users:

- **Admin**: `admin@acs.com` / `#admin123`
- **Cyclist 1**: `cyclist1@example.com` / `password123` (Carlos Rodríguez)
- **Cyclist 2**: `cyclist2@example.com` / `password123` (María García)
- **Cyclist 3**: `cyclist3@example.com` / `password123` (Javier Martínez)
- **Organizer**: `organizer@example.com` / `password123`
- **Staff**: `staff@example.com` / `password123`

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in UI mode (interactive)
npx playwright test --ui

# Run specific test file
npx playwright test e2e/auth.test.ts

# Run tests in headed mode (see browser)
npx playwright test --headed

# Debug a specific test
npx playwright test --debug e2e/auth.test.ts
```

## Test Structure

- **`fixtures/`** - Test data and user credentials
  - `test-users.ts` - Credentials for seeded test users
  - `test-data.ts` - Event/Race/Cyclist references from seed data

- **`helpers/`** - Reusable test utilities
  - `auth.ts` - Login, logout, and authentication assertions
  - `navigation.ts` - Navigation and filter helpers

- **Test Suites:**
  - `auth.test.ts` - Authentication flows (6 tests)
  - `events.test.ts` - Event browsing and filtering (8 tests)
  - `cyclists.test.ts` - Cyclist profile viewing (3 tests)
  - `portal.test.ts` - Portal access and logout (2 tests)
  - `navigation.test.ts` - Navigation and error handling (6 tests)

## Current Test Coverage

**Total: 25 E2E tests**

### Authentication (6 tests)

- ✅ User can login with valid credentials
- ✅ Login shows error for invalid credentials
- ✅ Authenticated user can access portal
- ✅ Unauthenticated user redirects to login from portal
- ✅ User can logout successfully
- ✅ Authenticated user redirects from login to portal

### Event Browsing (8 tests)

- ✅ Home page displays future events correctly
- ✅ Home page handles empty events gracefully
- ✅ Results page displays past events for current year
- ✅ Year filter updates past events list
- ✅ Event detail page shows event information
- ✅ Category filter updates race results
- ✅ Gender filter updates race results
- ✅ No results message for non-existent race combinations

### Cyclist Profile (3 tests)

- ✅ Cyclist profile displays details and race history
- ✅ Results sorted by date (most recent first)
- ✅ Non-existent cyclist shows 404 page

### Portal (2 tests)

- ✅ Authenticated user sees portal dashboard
- ✅ User can logout successfully

### Navigation (6 tests)

- ✅ Header navigation links work correctly
- ✅ Event card links to event detail page
- ✅ Cyclist link in results navigates to profile
- ✅ Non-existent event shows error or 404
- ✅ Global alert displays error messages
- ✅ Authenticated user sees account link in header

## Troubleshooting

### Tests failing with "Invalid login credentials"

**Solution**: Run `npm run seed:users` to create test users in the database.

### Tests timeout waiting for navigation

**Solution**: Ensure the development server is running (`npm run dev`) or build the app before tests.

### Browser not installed error

**Solution**: Run `npx playwright install` to download browser binaries.

### Tests skipped

Some tests are designed to skip gracefully if test data doesn't exist. This is expected behavior for tests that depend on specific seed data being present.

## Test Configuration

Configuration is in `playwright.config.ts`:

- **Base URL**: `http://localhost:4173` (production build)
- **Timeout**: 30 seconds per test
- **Retries**: 2 in CI, 0 locally
- **Browsers**: Chromium (headless)
- **Screenshots**: Captured on failure
- **Traces**: Captured on first retry

## Notes

- **No User Creation**: E2E tests use existing seeded users only. User registration tests are skipped until a test database is available.
- **Spanish Language**: Tests work with Spanish UI (default language).
- **Graceful Degradation**: Tests skip when expected data isn't available rather than failing.

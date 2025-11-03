# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Amateur Cycling Stats UI is a SvelteKit application for managing amateur cycling statistics. This is a **frontend-only application** that consumes a REST API backend (Strapi CMS running on localhost:1337).

**Migration Status:** ✅ **COMPLETE** - This project has been fully migrated from Next.js/React to SvelteKit/Svelte with 100% feature parity.

## Technology Stack

- **Framework**: SvelteKit 2.47.1 with Svelte 5 (using latest runes syntax)
- **Language**: TypeScript 5.9.3 (strict mode enabled)
- **Styling**: Tailwind CSS 4.1.14
- **State**: Svelte Stores (migrated from Zustand)
- **Build**: Vite 7.1.10
- **Testing**: Vitest (unit) + Playwright (e2e)

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Type checking
npm run check
npm run check:watch  # Watch mode

# Code quality
npm run lint         # Run Prettier + ESLint
npm run format       # Auto-format with Prettier

# Testing
npm run test:unit    # Run Vitest unit tests
npm run test:e2e     # Run Playwright e2e tests
npm run test         # Run all tests (unit + e2e)
```

## Architecture

### Directory Structure

- **`src/lib/`** - Reusable code (imported via `$lib` alias)
  - `components/` - Reusable Svelte components
  - `types/` - TypeScript definitions organized by domain
    - `entities/` - Domain entities (Event, Race, Cyclist, RaceResult, RankingPoints, User, Role)
    - `collections/` - Enums and reference data (EventStatus, RaceCategory, Gender, Length, RoleType)
    - `services/` - Service response types (UserResponse, UserSessionResponse, etc.)
  - `services/` - API service functions (events, races, cyclists, users, auth)
  - `stores/` - Svelte stores for global state (alert-store)
  - `constants/` - Application constants (urls)
  - `utils/` - Utility functions (dates, session)
  - `i18n/` - Internationalization (planned for future)
- **`src/routes/`** - SvelteKit file-based routing
  - `+layout.svelte` - Root layout wrapper with Header and GlobalAlert
  - `+layout.server.ts` - Server load function for user authentication state
  - `+page.svelte` - Route page components
  - `+page.server.ts` - Server-side data loading and form actions

### Complete Route Structure

**Public Routes:**
- `/` - Home page with upcoming events (SSR)
- `/results` - Past events listing with year filter (SSR)
- `/results/[id]` - Event detail with race results and filters (SSR)
- `/cyclists` - Cyclists listing (stub page)
- `/cyclists/[id]` - Cyclist profile with race history (SSR)
- `/teams` - Teams page (stub)
- `/ranking` - Ranking page (stub)

**Authentication Routes:**
- `/login` - Login page with form actions
- `/signin` - Registration page with form actions
- `/portal` - Protected user dashboard with onboarding (requires authentication)

### Component Library

**Layout Components:**
- `Header.svelte` - Main navigation with authentication state
- `GlobalAlert.svelte` - Global error/notification system

**Table Components:**
- `EventResultsTable.svelte` - Display events with date, name, location
- `ResultsTable.svelte` - Display race results with cyclist links
- `CyclistResultsTable.svelte` - Display cyclist's race history

**Form Components:**
- `SelectQueryParam.svelte` - URL-based filter dropdowns
- `Onboarding.svelte` - Role selection for new users

### Service Layer (Complete)

All services located in `src/lib/services/`:

1. **events.ts** - Event operations
   - `getFutureEvents()` - Upcoming events
   - `getPastEvents(params)` - Past events by year
   - `getEventWithCategoriesById(params)` - Event with categories

2. **races.ts** - Race operations
   - `getRaceWithResultsWithFilters(params)` - Race with filtered results

3. **race-results.ts** - Race results operations
   - `getRaceResultsByRaceId(params)` - Results for specific race

4. **cyclists.ts** - Cyclist operations
   - `getCyclistWithResultsById(params)` - Cyclist with race history
   - `createCyclist(cyclist)` - Create new cyclist

5. **users.ts** - User operations
   - `getMyself(jwt)` - Get current user with role
   - `updateUser(jwt, params)` - Update user role

6. **users-management.ts** - Authentication
   - `login(credentials)` - User login
   - `signin(credentials)` - User registration

7. **roles.ts** - Role management
   - `getRoles(jwt)` - Get available roles

### Key Patterns

**Server-Side Rendering (SSR):**
- All pages use `+page.server.ts` for data loading
- Data fetched on the server for SEO and performance
- No client-side data fetching with `onMount` (legacy pattern removed)
- Example pattern:
  ```typescript
  // +page.server.ts
  export const load: PageServerLoad = async ({ params, url }) => {
    const data = await fetchData(params.id);
    return { data };
  };
  ```

**Form Actions (Progressive Enhancement):**
- Forms use SvelteKit form actions for POST requests
- Work without JavaScript, enhanced with `use:enhance`
- Server-side validation and error handling
- Example pattern:
  ```typescript
  // +page.server.ts
  export const actions = {
    default: async ({ request, cookies }) => {
      const formData = await request.formData();
      // Process form data
      return { success: true };
    }
  };
  ```

**Authentication & Session Management:**
- Cookie-based authentication (HTTP-only cookies)
- JWT stored in `jwt-session` cookie (24-hour expiration)
- Session utilities in `src/lib/utils/session.ts`:
  - `saveJWT(cookies, jwt)` - Save JWT to cookie
  - `getJWT(cookies)` - Retrieve JWT from cookie
  - `revokeJWT(cookies)` - Delete JWT cookie (logout)
- Root layout loads user state for all pages
- Protected routes redirect to `/login` if not authenticated

**API Service Pattern:**
- Services use `fetch` with `qs` library for building query strings
- API URL configured via `VITE_SERVICE_URL` environment variable
- Services return strongly-typed responses based on `types/services/`
- All services accept parameters as function arguments
- Services throw errors for failed requests
- Example pattern:
  ```typescript
  export const getResource = async (jwt: string, params): Promise<Type> => {
    const query = qs.stringify({ filters: params });
    const response = await fetch(`${import.meta.env.VITE_SERVICE_URL}/api/resource?${query}`, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(response.statusText);
    return (await response.json()).data;
  };
  ```

**Type Organization:**
- Entities represent domain objects with properties and relationships
- Collections define enums and reference data used across entities
- Service types define API response structures with error handling

**State Management:**
- Svelte stores for global state (e.g., `alert-store.ts`)
- Component-level `$state` runes for local reactive state
- `$derived` runes for computed values
- `$effect` runes for side effects and reactivity
- No `onMount` for data fetching (use SSR instead)

**Component Structure:**
- TypeScript script blocks with explicit type annotations
- Svelte 5 runes syntax (`$props`, `$state`, `$derived`, `$effect`)
- Tailwind utility classes for styling
- Progressive enhancement with `use:enhance` directive

## API Integration

The application connects to a backend API (likely Strapi-based) configured via `.env`:

```
VITE_SERVICE_URL=http://localhost:1337
```

**Common API Patterns:**
- Base path: `/api/{resource}`
- Query building with `qs` library for filters, sorting, and population
- Example: `/api/events?populate[races][populate]=*&filters[startDate][$gte]=...`

**Data Flow:**
1. Component calls service function from `$lib/services/`
2. Service builds query with `qs` and fetches from API
3. Response typed according to `$lib/types/services/`
4. Component renders with typed data

## Domain Model

**Core Entities:**
- **Event** - A cycling event containing multiple races with location, dates, and status
- **Race** - Individual race within an event with category, gender, length, and ranking
- **Cyclist** - Athlete with name, birth year, gender, and race results
- **RaceResult** - Performance record linking cyclist to race via ranking points
- **User** - Application user with username, email, and role
- **Role** - User role defining permissions (Cyclist, Organizer, etc.)

**Event Status Flow:**
- DRAFT → AVAILABLE → SOLD_OUT → ON_GOING → FINISHED

**User Roles:**
- `PUBLIC` - Anonymous visitors
- `NEW_USER` (authenticated) - Newly registered users (must complete onboarding)
- `CYCLIST` - Registered cyclists
- `ORGANIZER_ADMIN` - Event organizers with admin access
- `ORGANIZER_STAFF` - Event organizers with staff access

**Authentication Flow:**
1. User registers → Receives `NEW_USER` role → Redirected to portal
2. Portal shows onboarding → User selects role (Cyclist/Organizer)
3. Role updated → User gains access to role-specific features

## Migration Context

**Status:** ✅ Migration from Next.js to SvelteKit is **COMPLETE** with 100% feature parity.

**Key Conversions Made:**
- React components → Svelte 5 components with runes
- Zustand stores → Svelte stores
- Material-UI → Tailwind CSS v4
- Next.js App Router → SvelteKit file-based routing
- Server Components → SvelteKit SSR with `+page.server.ts`
- Server Actions → SvelteKit form actions
- `next-auth` cookies → Custom cookie-based JWT session
- `useFormState` hooks → SvelteKit `use:enhance` directive
- `next-intl` → Hardcoded Spanish text (i18n planned for future)

**Architecture Improvements:**
- 100% server-side rendering (no client-side data fetching)
- Progressive enhancement with form actions
- Type-safe throughout with strict TypeScript
- Cleaner component structure with Svelte 5 runes
- Better performance with Svelte's compile-time optimizations
- Smaller bundle sizes (no React runtime)

**API Compatibility:**
- All API contracts maintained exactly
- Same Strapi backend endpoints
- Identical data structures and types
- No backend changes required

## Testing

**Unit Tests:**
- Located alongside components (`*.spec.ts`)
- Use Vitest with browser environment
- Component testing via `vitest-browser-svelte`
- Example: `src/routes/+page.svelte.spec.ts`

**E2E Tests:**
- Located in `e2e/` directory
- Use Playwright with Chromium
- Test full user flows against running dev server
- Run development server before E2E tests

## Development Best Practices

**When Adding New Pages:**
1. Create `+page.svelte` for the UI
2. Create `+page.server.ts` for SSR data loading
3. Use `PageServerLoad` type from `./$types`
4. Add form actions if page has forms
5. Handle errors with SvelteKit's `error()` helper
6. Add `<svelte:head>` for SEO meta tags

**When Adding New Components:**
1. Use `.svelte` extension (not `.tsx` or `.jsx`)
2. Use Svelte 5 runes syntax (`$props`, `$state`, `$derived`)
3. Add TypeScript type annotations
4. Use Tailwind CSS for styling
5. Place in `src/lib/components/` directory
6. Export for use in other components

**When Adding New Services:**
1. Place in `src/lib/services/` directory
2. Use `qs` library for query string building
3. Add proper TypeScript types for parameters and returns
4. Handle errors appropriately (throw or return error objects)
5. Use `cache: 'no-store'` for fresh data
6. Add JWT authorization header when required

**Authentication Pattern:**
```typescript
// In +page.server.ts
import { getJWT } from '$lib/utils/session';
import { getMyself } from '$lib/services/users';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies }) => {
  const jwt = getJWT(cookies);
  if (!jwt) throw redirect(302, '/login');

  const user = await getMyself(jwt);
  if (user.error) throw redirect(302, '/login');

  return { user: user.data };
};
```

**Form Action Pattern:**
```typescript
// In +page.server.ts
export const actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const field = formData.get('field')?.toString();

    // Validation
    if (!field) {
      return fail(400, { error: 'Field is required' });
    }

    // Process
    const result = await processData(field);

    // Success - redirect or return data
    throw redirect(302, '/success');
  }
};
```

**URL Filter Pattern:**
```typescript
// In +page.server.ts
export const load: PageServerLoad = async ({ url }) => {
  const filter = url.searchParams.get('filter') || 'default';
  const data = await fetchData({ filter });
  return { data, selectedFilter: filter };
};
```

## Common Gotchas

1. **Don't use `onMount` for data fetching** - Use `+page.server.ts` instead
2. **Don't forget `use:enhance`** - Always add to forms for progressive enhancement
3. **Import from `$lib`** - Use path alias instead of relative imports
4. **Use proper TypeScript types** - Import from `./$types` for load functions
5. **Handle authentication in server code** - Never expose JWT to client
6. **Use `goto()` for client-side navigation** - Use `redirect()` for server-side
7. **Check cookies in server code only** - Cookies aren't available in client components

## Future Enhancements

**Planned Features:**
- Internationalization (i18n) system to replace hardcoded Spanish text
- Advanced search functionality for cyclists and events
- Admin dashboard for event/race management
- Real-time updates with WebSockets
- Image optimization and lazy loading
- Enhanced SEO with dynamic meta tags

**Potential Improvements:**
- Loading states with `+loading.svelte`
- Custom error pages with `+error.svelte`
- API route handlers with `+server.ts`
- Middleware for common logic
- Rate limiting for form submissions
- Email verification flow
- Password reset functionality

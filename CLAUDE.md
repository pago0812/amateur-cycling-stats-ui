# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Amateur Cycling Stats UI is a SvelteKit application for managing amateur cycling statistics. The application uses **Supabase** as its backend (PostgreSQL database with Row Level Security, authentication, and real-time capabilities).

**Migration Status:**
- ✅ **Next.js → SvelteKit**: COMPLETE with 100% feature parity
- ✅ **Strapi → Supabase**: COMPLETE with improved schema and RLS policies
- ✅ **Authentication**: COMPLETE - Fully migrated to Supabase Auth with SSR cookie handling

## Technology Stack

- **Framework**: SvelteKit 2.47.1 with Svelte 5 (using latest runes syntax)
- **Language**: TypeScript 5.9.3 (strict mode enabled)
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Styling**: Tailwind CSS 4.1.14
- **State**: Svelte Stores (migrated from Zustand)
- **Build**: Vite 7.1.10
- **Testing**: Vitest (unit) + Playwright (e2e)
- **Database Migrations**: Supabase CLI

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
    - `database.types.ts` - **Auto-generated** Supabase types (regenerate after schema changes)
    - `entities/` - Domain entities (Event, Race, Cyclist, RaceResult, RankingPoint, User, Role, Organization, Organizer)
    - `collections/` - Enums and reference data (EventStatus, RaceCategory, Gender, Length, RaceRanking)
    - `services/` - Service response types (UserResponse, UserSessionResponse, etc.)
  - `services/` - API service functions (events, races, cyclists, users, auth)
  - `server/` - Server-side utilities (Supabase client creation)
  - `stores/` - Svelte stores for global state (alert-store)
  - `constants/` - Application constants (urls)
  - `utils/` - Utility functions (dates, session)
  - `i18n/` - Internationalization (planned for future)
- **`src/routes/`** - SvelteKit file-based routing
  - `+layout.svelte` - Root layout wrapper with Header and GlobalAlert
  - `+layout.server.ts` - Server load function for user authentication state
  - `+page.svelte` - Route page components
  - `+page.server.ts` - Server-side data loading and form actions
- **`src/hooks.server.ts`** - SvelteKit server hooks for session management and Supabase client
- **`supabase/`** - Supabase configuration and migrations
  - `migrations/` - Database migration files (SQL)
  - `seed.sql` - Seed data for development (admin user)

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
   - `getMyself(supabase)` - Get current user with role
   - `updateUser(supabase, params)` - Update user role

6. **users-management.ts** - Authentication (Supabase Auth)
   - `login(supabase, credentials)` - User login with Supabase
   - `signin(supabase, credentials)` - User registration with Supabase

7. **roles.ts** - Role management
   - `getRoles(supabase)` - Get available roles

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
- Supabase Auth with automatic cookie management via `@supabase/ssr`
- Server-side session handling in `hooks.server.ts`
- Supabase client attached to `event.locals.supabase` for all requests
- `event.locals.safeGetSession()` helper returns enriched user data via `get_user_with_relations()` RPC
- HTTP-only cookies managed automatically by Supabase
- Root layout loads user state for all pages via `safeGetSession()`
- Protected routes redirect to `/login` if not authenticated
- User-friendly error messages in Spanish using Supabase error codes

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

## Supabase Integration

### Database Configuration

The application uses **Supabase** for backend services (PostgreSQL, Auth, Storage). Configuration stored in `.env`:

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (server-only)
```

### Database Migrations

All database schema changes are managed through Supabase migrations located in `supabase/migrations/`.

**Migration Commands:**
```bash
# Create new migration
supabase migration new migration_name

# Push migrations to remote
supabase db push

# Pull schema from remote
supabase db pull

# List applied migrations
supabase migration list

# Reset local database
supabase db reset

# Regenerate TypeScript types
supabase gen types typescript --linked > src/lib/types/database.types.ts
```

**IMPORTANT:** Always regenerate types after schema changes!

### Type Safety with Supabase

All database types are auto-generated from the schema:

```typescript
import type { Tables, TablesInsert, TablesUpdate } from '$lib/types/database.types';

// Get row type for a table
type Event = Tables<'events'>;

// Get insert type (optional fields)
type EventInsert = TablesInsert<'events'>;

// Get update type (all optional)
type EventUpdate = TablesUpdate<'events'>;
```

**Extended Types with Relationships:**
```typescript
import type { EventWithRelations } from '$lib/types/entities/events';

// Base type = database row
type Event = Tables<'events'>;

// Extended type = with populated relationships
interface EventWithRelations extends Event {
  organization?: Organization;
  races?: Race[];
  // ...
}
```

### Data Access Patterns

**Supabase Client:**
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

const supabase = createClient<Database>(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY
);

// Query with types
const { data, error } = await supabase
  .from('events')
  .select('*, organization(*), races(*)')
  .eq('is_public_visible', true);
```

**Row Level Security (RLS):**
- All tables have RLS enabled
- Policies enforce permissions based on user roles
- Public can view public content
- Authenticated users have role-based access
- See migration files for complete policy definitions

## Domain Model

### Core Entities

**Authentication & Authorization:**
- **User** - Authenticated users linked to Supabase Auth (username, role)
- **Role** - User roles defining permissions (5 types: PUBLIC, CYCLIST, ORGANIZER_STAFF, ORGANIZER_ADMIN, ADMIN)
- **Organization** - Companies/clubs that organize cycling events
- **Organizer** - Junction table linking users to organizations (separates auth from business logic)

**Events & Races:**
- **Event** - Cycling event owned by an organization (location, dates, status, visibility)
- **Race** - Individual race within an event (category, gender, length, ranking, own visibility)
- **RaceResult** - Performance record linking cyclist to race with ranking points

**Athletes:**
- **Cyclist** - Athlete profile (name, birth year, gender, optional user link)
  - Can be created by organizers without user accounts (for unregistered athletes)
  - Can be linked to user accounts later via reconciliation

**Reference Data (Lookup Tables):**
- **RaceCategory** - Age/experience categories (26 types: ABS, ELITE, age ranges, etc.)
- **RaceCategoryGender** - Gender categories (FEMALE, MALE, OPEN)
- **RaceCategoryLength** - Distance types (LONG, SHORT, SPRINT, UNIQUE)
- **RaceRanking** - Ranking systems (UCI, NATIONAL, REGIONAL, CUSTOM)
- **CyclistGender** - Cyclist genders (M, F)
- **RankingPoint** - Points awarded per place in ranking systems

### Relationships

**User → Organizer → Organization → Event Flow:**
```
User (authenticated via Supabase Auth)
  ↓ (if role = ORGANIZER_ADMIN/ORGANIZER_STAFF)
Organizer (links user to organization)
  ↓
Organization (owns events)
  ↓
Events (managed by organization)
  ↓
Races (within events)
  ↓
RaceResults (links cyclists to races)
```

**Event Ownership:**
- `created_by` → tracks which user created the event (audit trail)
- `organization_id` → tracks which organization owns/manages the event

**1:n Relationships:**
- Organization → Organizers
- Organization → Events
- Event → Races
- Race → RaceResults
- Cyclist → RaceResults

**n:n Relationships:**
- Event ↔ RaceCategories (supported categories for event)
- Event ↔ RaceCategoryGenders (supported genders for event)
- Event ↔ RaceCategoryLengths (supported lengths for event)

### Business Rules

**Event Status Flow:**
- DRAFT → AVAILABLE → SOLD_OUT → ON_GOING → FINISHED

**User Roles & Permissions:**
- `PUBLIC` - Anonymous visitors (read-only for public content)
- `CYCLIST` - Default role for new signups (edit own profile, register for events)
- `ORGANIZER_STAFF` - Limited admin access (create/edit race results for org's events)
- `ORGANIZER_ADMIN` - Full org access (manage events, races, results for org)
- `ADMIN` - System administrator (full access to everything)

**Authentication Flow:**
1. User signs up via Supabase Auth → Auto-creates user profile with CYCLIST role
2. Auto-creates minimal cyclist profile (empty name/last_name, to be filled later)
3. Organizers: Admin manually creates organizer profile linking user to organization

**Organizer Workflow:**
1. Organizer creates event for their organization
2. Organizer creates races within event
3. Organizer creates race results → can create cyclist profiles if athlete not registered
4. Later: Athlete signs up → reconciliation process links user to existing cyclist profile

**Visibility Rules:**
- Events/Races have independent `is_public_visible` flags
- Public users only see content where both event AND race are public
- Organization members see all their org's content
- Admins see everything

## Migration Context

### Frontend Migration: Next.js → SvelteKit

**Status:** ✅ **COMPLETE** with 100% feature parity

**Key Conversions:**
- React components → Svelte 5 components with runes
- Zustand stores → Svelte stores
- Material-UI → Tailwind CSS v4
- Next.js App Router → SvelteKit file-based routing
- Server Components → SvelteKit SSR with `+page.server.ts`
- Server Actions → SvelteKit form actions
- `next-auth` cookies → Cookie-based session (to be updated for Supabase Auth)
- `useFormState` hooks → SvelteKit `use:enhance` directive
- `next-intl` → Hardcoded Spanish text (i18n planned for future)

**Architecture Improvements:**
- 100% server-side rendering (no client-side data fetching)
- Progressive enhancement with form actions
- Type-safe throughout with strict TypeScript
- Cleaner component structure with Svelte 5 runes
- Better performance with Svelte's compile-time optimizations
- Smaller bundle sizes (no React runtime)

### Backend Migration: Strapi → Supabase

**Status:** ✅ **COMPLETE** with improved schema and security

**Database Changes:**
- Strapi headless CMS → Supabase PostgreSQL
- REST API → Supabase SDK with auto-generated types
- Custom auth → Supabase Auth (built-in email/password, OAuth)
- No RLS → Comprehensive Row Level Security policies
- Manual type definitions → Auto-generated from schema

**Schema Improvements:**
1. **Removed Strapi Artifacts:**
   - Removed `documentId` from all entities
   - Cleaner UUID-based primary keys
   - Standard PostgreSQL constraints

2. **New Entity: Organizations**
   - Proper separation of organizations from users
   - Events owned by organizations (not individual users)

3. **New Junction Table: Organizers**
   - Links users to organizations
   - Separates authentication from business logic
   - Enables multi-user organizations

4. **Improved Cyclist Model:**
   - `user_id` is nullable (organizers can create cyclists for unregistered athletes)
   - Reconciliation workflow for linking later

5. **Enhanced Visibility Control:**
   - Events AND races have independent `is_public_visible` flags
   - More granular access control

6. **Audit Trail:**
   - `created_by` tracks who created each event
   - `created_at` and `updated_at` timestamps on all tables

**Security Improvements:**
1. **Row Level Security (RLS):**
   - All tables have RLS enabled
   - Role-based policies (PUBLIC, CYCLIST, ORGANIZER_STAFF, ORGANIZER_ADMIN, ADMIN)
   - Organization-based access control

2. **Helper Functions:**
   - `is_admin()` - Check if user is admin
   - `is_organizer()` - Check if user is organizer
   - `is_organizer_admin()` - Check if user is organizer admin (not staff)
   - `is_in_event_organization()` - Check if user belongs to event's organization
   - `get_user_organization_id()` - Get user's organization ID

3. **Automatic Triggers:**
   - Auto-create user profile on signup (via Supabase Auth)
   - Auto-create cyclist profile for CYCLIST role users
   - Auto-update timestamps on changes

**Type System:**
- `database.types.ts` - Auto-generated from schema (regenerate after migrations)
- Base types (`Tables<'table_name'>`) for database operations
- Extended types (`*WithRelations`) for populated data
- Full type safety with Supabase SDK

**Migration Files (13 total):**

**Schema & RLS (8 migrations):**
1. `20251103204940` - Create roles & users tables with auth integration
2. `20251103210005` - Seed admin user (admin@acs.com / #admin123)
3. `20251103212059` - Create organizations & organizers tables
4. `20251103212210` - Create lookup tables (categories, genders, lengths, rankings)
5. `20251103212355` - Create main entities (cyclists, events, races, results, ranking_points)
6. `20251103212634` - Create comprehensive RLS policies
7. `20251103222059` - Refactor: organizers junction table
8. `20251103223053` - Fix: events link to organizations (not individual organizers)

**Authentication & Data Fixes (5 migrations):**
9. `20251104154243` - Add `get_user_with_relations()` RPC function for enriched user data
10. `20251104160611` - Fix `get_user_with_relations()` to match organization schema
11. `20251104165625` - Fix NULL token fields in auth.users (convert to empty strings)
12. `20251104171051` - Fix missing timestamp fields in test users
13. `20251104171807` - Update test users with correct bcrypt password hashes

**Test User Credentials:**
- Admin: `admin@acs.com` / `#admin123`
- Cyclist 1: `cyclist1@example.com` / `password123`
- Cyclist 2: `cyclist2@example.com` / `password123`
- Organizer: `organizer@example.com` / `password123`
- Organizer Staff: `organizer_staff@example.com` / `password123`

**Completed Migration Work:**
- ✅ Updated service layer (users, users-management, roles) to use Supabase SDK
- ✅ Replaced session utils with Supabase Auth helpers via hooks.server.ts
- ✅ Updated authentication flows (login, signin, logout) to use Supabase Auth
- ✅ Created server-side Supabase client utilities in `src/lib/server/supabase.ts`
- ✅ Implemented `hooks.server.ts` for centralized session management
- ✅ Updated all protected routes to use `locals.safeGetSession()`
- ✅ Implemented user-friendly Spanish error messages using Supabase error codes

**Remaining Work:**
- Update remaining service layer (events, races, cyclists) to use Supabase SDK
- Migrate existing data from Strapi to Supabase (if needed)
- Update components to use new field names (camelCase → snake_case)

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

**Authentication Pattern (Supabase):**
```typescript
// In +page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Get session via Supabase helper from hooks.server.ts
  const { user } = await locals.safeGetSession();

  // Redirect if not authenticated
  if (!user) throw redirect(302, '/login');

  // User data includes: id, username, role_id, role, cyclist, organizer
  return { user };
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

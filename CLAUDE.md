# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Amateur Cycling Stats UI is a SvelteKit application for managing amateur cycling statistics. The application uses **Supabase** as its backend (PostgreSQL database with Row Level Security, authentication, and real-time capabilities).

**Migration Status:**

- ✅ **Next.js → SvelteKit**: COMPLETE with 100% feature parity
- ✅ **Strapi → Supabase**: COMPLETE with improved schema and RLS policies
- ✅ **Authentication**: COMPLETE - Fully migrated to Supabase Auth with SSR cookie handling
- ✅ **Internationalization (i18n)**: COMPLETE - Full i18n support with automatic language detection
- ✅ **Portal Refactoring**: COMPLETE - Split into `/panel` (public) and `/account` (settings)
- ✅ **Public IDs (short_id)**: COMPLETE - All public URLs use NanoID (10-char) instead of UUID

## Technology Stack

- **Framework**: SvelteKit 2.47.1 with Svelte 5 (using latest runes syntax)
- **Language**: TypeScript 5.9.3 (strict mode enabled)
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Styling**: Tailwind CSS 4.1.14
- **State**: Svelte Stores (migrated from Zustand)
- **Build**: Vite 7.1.10
- **Testing**: Vitest (unit) + Playwright (e2e)
- **Database Migrations**: Supabase CLI

## Critical Project Rules

1. **ALWAYS use Svelte 5 syntax** - This project uses Svelte 5, NOT Svelte 4
   - ✅ Use `$props()` for component props
   - ✅ Use `$state()` for reactive state
   - ✅ Use `$derived()` for computed values
   - ✅ Use `$effect()` for side effects
   - ✅ Use `{@render children()}` for slot content (NOT `<slot />`)
   - ✅ Use `children: Snippet` type for layout children
   - ❌ NEVER use `export let` for props (Svelte 4 syntax)
   - ❌ NEVER use `<slot />` (deprecated in Svelte 5)
   - ❌ NEVER use `$:` reactive statements (use `$derived` or `$effect` instead)

2. **Zero `any` Types Policy**
   - **NEVER** use `any` type in the codebase
   - All types must be explicit and type-safe
   - Use explicit Supabase response types for complex queries

3. **Domain Types Architecture**
   - All domain entities use **camelCase** properties
   - All domain entities use **`id` field ONLY** (no `documentId`, no dual naming)
   - Domain types are used throughout the application (components, pages, stores)
   - Database types (snake_case) are ONLY used in services and adapters

4. **Public ID Architecture (short_id with NanoID)**
   - **All public URLs use short_id** (10-character NanoID format: lowercase + numbers)
   - **Database uses dual-field system**: `id` (UUID - internal) + `short_id` (NanoID - public)
   - **Domain layer only knows `id: string`** (which receives the short_id value from adapters)
   - **Adapters translate at DB boundary**: `db.short_id` → `domain.id`
   - **Benefits**: Security (no UUID enumeration), URL-friendly, shorter links
   - **Pattern**:
     ```typescript
     // Database table has BOTH fields
     // id (UUID): b0a1c2d3-... (internal, never exposed)
     // short_id (NanoID): sm98nfmsd9 (public, in URLs)

     // Domain type (clean)
     interface Event {
       id: string; // This is the short_id, not UUID
       name: string;
       // ...
     }

     // Adapter translates
     export function adaptEventFromDb(db: EventDB): Event {
       return {
         id: db.short_id, // Translate: short_id → id
         name: db.name,
         // ...
       };
     }

     // URLs use short_id
     // /results/sm98nfmsd9
     // /cyclists/abc123xyz0
     ```
   - **Service Layer Patterns**:
     - **Direct short_id queries**: Most services query directly by short_id (events, cyclists)
     - **UUID conversion for FKs**: When filtering by foreign keys, convert short_id → UUID first
     - **RPC functions**: Accept short_id parameters, auto-convert internally
   - **Migration**: All tables have short_id column with auto-generation triggers

5. **Keep hooks.server.ts Lightweight**
   - `hooks.server.ts` should be easy to read and maintain as it runs on every request
   - Extract utility functions to appropriate modules (`$lib/i18n/`, `$lib/utils/`, etc.)
   - Keep only the core logic: Supabase client setup, session management, locale detection
   - All helper functions should be moved to dedicated utility files:
     - Locale detection → `$lib/i18n/locale.ts`
     - Cookie management → `$lib/utils/cookies.ts`
     - Other utilities → appropriate `$lib/utils/` files

6. **Internationalization (i18n) for All User-Facing Text**
   - **NEVER** use hardcoded strings in user-facing components or error messages
   - All text must use translation keys via `$t()` (client) or `t(locale, key)` (server)
   - **Error messages in SvelteKit `error()` must use i18n**: `error(404, t(locale, 'feature.errors.notFound'))`
   - Organize translations by feature in `src/lib/i18n/locales/{locale}/{feature}.json`
   - Each feature translation file should have an `errors` section for error messages
   - Example structure:
     ```json
     {
       "profile": { "title": "...", "field": "..." },
       "errors": {
         "notFound": "Resource not found",
         "loadFailed": "Failed to load resource"
       }
     }
     ```
   - Supported locales: `es` (Spanish - default), `en` (English)

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

# Database seeding
npm run seed:users   # Seed test users (run after supabase db reset)
```

## Architecture

### Directory Structure

- **`src/lib/`** - Reusable code (imported via `$lib` alias)
  - `components/` - Reusable Svelte components
  - `types/` - TypeScript definitions organized by domain
    - `database.types.ts` - **Auto-generated** Supabase types (regenerate after schema changes)
    - `db/` - **Explicit DB type aliases** - TableNameDB types + Supabase response types (ALWAYS use these)
    - `domain/` - **Domain entities** with camelCase properties (Event, Race, Cyclist, RaceResult, etc.) + enums (RoleTypeEnum)
    - `services/` - Service response types (UserResponse, UserSessionResponse, etc.)
  - `adapters/` - **Transform DB types (snake_case) to domain types (camelCase)**
    - `common.adapter.ts` - Reusable transformation utilities
    - Entity-specific adapters (events, races, race-results, cyclists, etc.)
  - `services/` - API service functions (events, races, cyclists, users, auth)
  - `server/` - Server-side utilities (Supabase client creation)
  - `stores/` - Svelte stores for global state (alert-store)
  - `constants/` - Application constants (urls)
  - `utils/` - Utility functions (dates, session, cookies)
  - `i18n/` - Internationalization (sveltekit-i18n)
    - `locale.ts` - Locale detection and validation utilities (parseAcceptLanguage, isSupportedLocale)
    - `server.ts` - Server-side translation helpers (t, getAuthErrorMessage)
    - `index.ts` - Client-side i18n configuration with route-based loaders
    - `locales/` - Translation JSON files organized by feature
      - `en/` - English translations (common, auth, cyclists, events, account, panel)
      - `es/` - Spanish translations (common, auth, cyclists, events, account, panel)
- **`src/routes/`** - SvelteKit file-based routing
  - `+layout.svelte` - Root layout wrapper with Header and GlobalAlert
  - `+layout.server.ts` - Server load function for user authentication state
  - `+page.svelte` - Route page components
  - `+page.server.ts` - Server-side data loading and form actions
- **`src/hooks.server.ts`** - SvelteKit server hooks for session management and Supabase client
- **`supabase/`** - Supabase configuration and migrations
  - `migrations/` - Database migration files (SQL)
  - `seed.sql` - User-independent seed data (organizations, unlinked cyclists, ranking points)
  - `seed-users.ts` - User-dependent seed data (users, events, races, results via Supabase Admin API)

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

- `/login` - Login page with form actions and i18n support
- `/signin` - Registration page with form actions and i18n support
- `/panel` - Public cyclist panel (profile display, requires authentication)
- `/account` - User account settings (email, username, role management, requires authentication)

### Component Library

**Layout Components:**

- `Header.svelte` - Main navigation with authentication state
- `GlobalAlert.svelte` - Global error/notification system

**Table Components:**

- `EventResultsTable.svelte` - Display events with date, name, location
- `ResultsTable.svelte` - Display race results with cyclist links
- `CyclistResultsTable.svelte` - Display cyclist's race history

**Profile Components:**

- `CyclistProfile.svelte` - Display cyclist profile information with i18n support

**Form Components:**

- `SelectQueryParam.svelte` - URL-based filter dropdowns

### Service Layer (Complete)

All services located in `src/lib/services/`:

1. **events.ts** - Event operations
   - `getFutureEvents()` - Upcoming events
   - `getPastEvents(params)` - Past events by year
   - `getEventWithCategoriesById(params)` - Event with categories

2. **races.ts** - Race operations
   - `getRaceWithResultsWithFilters(params)` - Race with filtered results (returns null if no race matches filters)

3. **race-results.ts** - Race results operations
   - `getRaceResultsByRaceId(params)` - Results for specific race

4. **cyclists.ts** - Cyclist operations
   - `getCyclistWithResultsById(params)` - Cyclist with race history (uses `get_cyclist_with_results()` RPC)
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
- `event.locals.safeGetSession()` helper uses `getUser()` to validate JWT with Auth server (more secure than `getSession()`)
- Returns enriched user data via `get_user_with_relations()` RPC
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

**Graceful Error Handling (Supabase Services):**

- Services distinguish between expected "not found" scenarios vs unexpected errors
- Return `null` for expected missing data (e.g., PGRST116 "no rows found")
- Throw errors only for unexpected database issues
- UI handles `null` gracefully with user-friendly messages
- Keep user controls (filters, dropdowns) visible even when data is missing
- Example pattern:

  ```typescript
  // Service layer - return null for expected missing data
  export async function getRaceWithFilters(
    supabase: TypedSupabaseClient,
    params: FilterParams
  ): Promise<Race | null> {
    const { data, error } = await supabase
      .from('races')
      .select('*')
      .eq('category_id', params.categoryId)
      .single();

    if (error) {
      // PGRST116 = no rows found - expected when race doesn't exist
      if (error.code === 'PGRST116') {
        return null;
      }
      // Other errors are unexpected - throw them
      throw new Error(`Error fetching race: ${error.message}`);
    }

    return data ? adaptRaceFromDb(data) : null;
  }

  // Page server - handle null gracefully
  export const load: PageServerLoad = async ({ params, locals }) => {
    const race = await getRaceWithFilters(locals.supabase, params);
    // Pass null to UI - let UI display friendly message
    return { race }; // Can be null
  };

  // UI component - show helpful message
  {#if race?.results && race.results.length > 0}
    <ResultsTable results={race.results} />
  {:else}
    <div class="text-center py-12 bg-gray-50 rounded-lg">
      <p class="text-gray-600 text-lg mb-2">
        No hay resultados disponibles para esta combinación de filtros
      </p>
      <p class="text-gray-500 text-sm">
        Intenta seleccionar otra categoría, género o distancia
      </p>
    </div>
  {/if}
  ```

**Type System Architecture (CRITICAL RULES):**

1. **Zero `any` Types Policy**
   - **NEVER** use `any` type in the codebase
   - All types must be explicit and type-safe
   - Use explicit Supabase response types for complex queries

2. **Domain Types (src/lib/types/domain/)**
   - All domain entities use **camelCase** properties (e.g., `dateTime`, `eventStatus`, `lastName`)
   - All domain entities use **`id` field ONLY** (no `documentId`, no dual naming)
   - Domain types are used throughout the application (components, pages, stores)
   - Example:
     ```typescript
     // ✅ CORRECT - Domain type with camelCase and id only
     export interface Event {
     	id: string; // ONLY id, no documentId
     	name: string;
     	dateTime: string; // camelCase
     	eventStatus: EventStatus;
     	isPublicVisible: boolean;
     	// ... all camelCase fields
     }
     ```

3. **Database Type Aliases (src/lib/types/db/) - REQUIRED**
   - **CRITICAL**: ALWAYS use explicit DB type aliases instead of `Tables<'table_name'>`
   - Naming convention: `TableNameDB` (e.g., `CyclistDB`, `EventDB`, `RaceDB`)
   - All DB types are exported from `$lib/types/db` for easy imports
   - Each file groups related types (base DB type + Supabase response types)
   - Example:

     ```typescript
     // ✅ CORRECT - Use explicit DB type alias
     import type { CyclistDB, EventDB } from '$lib/types/db';

     function adaptCyclist(dbCyclist: CyclistDB): Cyclist {
     	// Transform DB → Domain
     }

     // ❌ WRONG - Never use Tables<> directly
     import type { Tables } from '$lib/types/database.types';
     function adaptCyclist(dbCyclist: Tables<'cyclists'>): Cyclist {}
     ```

4. **Database Types (src/lib/types/database.types.ts)**
   - Auto-generated from Supabase schema via `supabase gen types`
   - Use **snake_case** (e.g., `date_time`, `event_status`, `last_name`)
   - **DO NOT use `Tables<'table_name'>` directly** - use DB type aliases instead
   - Only import `Database` type for Supabase client typing
   - Import via: `import type { Database, TablesInsert } from '$lib/types/database.types'`

5. **Supabase Response Types (Moved to src/lib/types/db/)**
   - Explicit types for complex nested Supabase queries
   - **NO `any` types allowed**
   - Grouped with related DB types in the same file
   - Used to type Supabase query results before adapter transformation
   - Example:

     ```typescript
     // src/lib/types/db/events.db.ts
     export type EventDB = Tables<'events'>;

     // ✅ CORRECT - Response type extends DB type
     export interface EventWithCategoriesResponse extends EventDB {
     	supportedCategories: Array<{
     		race_categories: {
     			id: string;
     			name: string;
     			created_at: string;
     			updated_at: string;
     		};
     	}>;
     }
     ```

6. **Adapter Layer (src/lib/adapters/)**
   - **REQUIRED** for all Supabase service methods
   - Transforms snake_case DB fields → camelCase domain fields
   - Keeps services clean and focused on business logic
   - Common utilities in `common.adapter.ts` (mapTimestamps, adaptArray, etc.)
   - Entity-specific adapters in separate files
   - Example:
     ```typescript
     // ✅ CORRECT - Adapter transforms DB → Domain
     export function adaptEventFromDb(dbEvent: Tables<'events'>): Event {
     	return {
     		id: dbEvent.id,
     		name: dbEvent.name,
     		dateTime: dbEvent.date_time, // snake_case → camelCase
     		eventStatus: dbEvent.event_status as Event['eventStatus'],
     		...mapTimestamps(dbEvent)
     	};
     }
     ```

7. **Service Layer Pattern**
   - Services work with Supabase SDK using DB type aliases
   - **ALWAYS** use adapters to transform results to domain types
   - Import DB types and response types from `$lib/types/db`
   - Return domain types (camelCase) to consumers
   - Example:

     ```typescript
     // ✅ CORRECT - Service uses DB types and adapters
     import type { EventDB, EventWithCategoriesResponse } from '$lib/types/db';
     import { adaptEventFromDb } from '$lib/adapters';

     export async function getEventById(
     	supabase: TypedSupabaseClient,
     	params: GetEventByIdParams
     ): Promise<Event> {
     	const { data, error } = await supabase
     		.from('events')
     		.select('*')
     		.eq('id', params.id)
     		.single();

     	if (error) throw new Error(`Error fetching event: ${error.message}`);

     	return adaptEventFromDb(data); // Transform EventDB → Event (domain)
     }
     ```

**Type Organization:**

- Domain types represent business entities with camelCase properties
- DB types alias auto-generated database types for explicit usage
- Service types define API response structures with error handling

**State Management:**

- Svelte stores for global state (e.g., `alert-store.ts`)
- Component-level `$state` runes for local reactive state
- `$derived` runes for computed values
- `$effect` runes for side effects and reactivity
- No `onMount` for data fetching (use SSR instead)

**Component Structure (Svelte 5):**

- TypeScript script blocks with explicit type annotations
- **Svelte 5 runes syntax** (see Critical Project Rules above)
  - `let { propName }: { propName: Type } = $props()` for component props
  - `let reactiveVar = $state(initialValue)` for reactive state
  - `let computed = $derived(expression)` for computed values
  - `$effect(() => { /* side effects */ })` for effects
- Tailwind utility classes for styling
- Progressive enhancement with `use:enhance` directive
- Example component pattern:

  ```svelte
  <script lang="ts">
  	import type { Event } from '$lib/types/domain';

  	// Props using $props()
  	let { events }: { events: Event[] } = $props();

  	// Reactive state using $state()
  	let selectedId = $state<string | null>(null);

  	// Computed values using $derived()
  	let selectedEvent = $derived(events.find((e) => e.id === selectedId));

  	// Side effects using $effect()
  	$effect(() => {
  		console.log('Selected:', selectedEvent);
  	});
  </script>
  ```

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

# Reset local database (runs migrations + seed.sql)
supabase db reset

# Regenerate TypeScript types
supabase gen types typescript --linked > src/lib/types/database.types.ts
```

**IMPORTANT:** Always regenerate types after schema changes!

### Seeding Test Data

The project uses a **two-stage seeding approach** that separates user-independent data from user-dependent data:

**Stage 1: User-Independent Data (SQL)**

- Run automatically during `supabase db reset`
- Creates foundational data that doesn't require users to exist
- Defined in `supabase/seed.sql`

**Stage 2: User-Dependent Data (TypeScript)**

- Run manually after database reset via `npm run seed:users`
- Uses Supabase Admin API to create users with proper auth fields
- Creates all data that requires user foreign keys (events, races, results)
- Defined in `supabase/seed-users.ts`

**Why this approach?**

- **Avoids foreign key constraint errors**: Events require `created_by` user IDs, so users must exist first
- **Proper auth field initialization**: Supabase Admin API automatically handles all required `auth.users` fields (token fields, timestamps)
- **Prevents NULL token errors**: Manual user insertion can cause authentication failures
- **Type-safe and maintainable**: TypeScript provides better error handling and IDE support
- **Clear separation of concerns**: User-independent vs user-dependent data

**Seeding Workflow:**

```bash
# 1. Reset database (runs migrations + seed.sql automatically)
supabase db reset --linked --yes

# 2. Seed users and user-dependent data
npm run seed:users
```

**What Each Script Creates:**

`seed.sql` (User-Independent):

- 2 Organizations (Pro Cycling League Spain, Valencia Cycling Federation)
- 5 Unlinked cyclists (athletes without user accounts)
- 4 Ranking systems with ~38 ranking points (UCI, NATIONAL, REGIONAL, CUSTOM)

`seed-users.ts` (User-Dependent):

- 6 Test users with full authentication (admin, organizer, staff, 3 cyclists)
- 4 Events (past, future, draft, ongoing) - requires `created_by` user field
- 12 Races (3 per event) - requires events to exist
- ~54 Race results - requires races and cyclists to exist

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
Extended domain types with relationships are defined in the domain folder. For example:

```typescript
import type { Event } from '$lib/types/domain';

// Domain type already includes relationships when needed
// Adapters transform DB response types to domain types
```

### Data Access Patterns

**Supabase Client:**

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

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
- `next-auth` → Supabase Auth with automatic cookie management
- `useFormState` hooks → SvelteKit `use:enhance` directive
- `next-intl` → `sveltekit-i18n` with automatic language detection

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

**Migration Files (7 total):**

1. `20250101000001_create_auth_foundation.sql`
   - Creates roles table with 5 role types
   - Creates users table linked to Supabase Auth
   - Sets up auth triggers for automatic user profile creation
   - Establishes foundation for role-based access control

2. `20250101000002_create_organizations_and_organizers.sql`
   - Creates organizations table for event management companies
   - Creates organizers junction table linking users to organizations
   - Enables multi-user organization support
   - Adds triggers for automatic organizer profile creation

3. `20250101000003_create_lookup_tables.sql`
   - Creates reference data tables: cyclist_genders, race_categories, race_category_genders, race_category_lengths, race_rankings
   - Seeds 26 race categories, 3 genders, 4 length types, 4 ranking systems
   - Provides standardized enums for race configuration

4. `20250101000004_create_main_entities.sql`
   - Creates core domain tables: cyclists, events, races, race_results, ranking_points
   - Creates event junction tables for supported categories/genders/lengths
   - Adds trigger for automatic cyclist profile creation for CYCLIST role users
   - Establishes complete data model for cycling events

5. `20250101000005_create_rls_policies.sql`
   - Enables Row Level Security on all tables
   - Creates role-based policies (PUBLIC, CYCLIST, ORGANIZER_STAFF, ORGANIZER_ADMIN, ADMIN)
   - Implements organization-based access control for events/races/results
   - Defines helper functions: is_admin(), is_organizer(), is_organizer_admin(), is_in_event_organization()

6. `20250101000006_create_utility_functions.sql`
   - Creates `get_user_with_relations()` RPC function for enriched user data
   - Returns user with role, cyclist profile, and organizer relationships
   - Used by `safeGetSession()` in hooks.server.ts for SSR

7. `20250105000001_create_cyclist_functions.sql`
   - Creates `get_cyclist_with_results()` RPC function for optimized cyclist data retrieval
   - Returns cyclist with nested race results, full race details, events, categories, and ranking points
   - Single PostgreSQL query with 11 JOINs - replaces complex nested Supabase select
   - Results automatically sorted by event date (most recent first)
   - Improves performance for cyclist profile pages

**Test User Credentials (created by seed-users.ts):**

- Admin: `admin@acs.com` / `#admin123`
- Organizer Admin: `organizer@example.com` / `password123` (Pro Cycling League Spain)
- Organizer Staff: `staff@example.com` / `password123` (Valencia Cycling Federation)
- Cyclist 1: `cyclist1@example.com` / `password123` (Carlos Rodríguez)
- Cyclist 2: `cyclist2@example.com` / `password123` (María García)
- Cyclist 3: `cyclist3@example.com` / `password123` (Javier Martínez)

**Completed Migration Work:**

- ✅ Updated service layer (users, users-management, roles) to use Supabase SDK
- ✅ Replaced session utils with Supabase Auth helpers via hooks.server.ts
- ✅ Updated authentication flows (login, signin, logout) to use Supabase Auth
- ✅ Created server-side Supabase client utilities in `src/lib/server/supabase.ts`
- ✅ Implemented `hooks.server.ts` for centralized session management
- ✅ Updated all protected routes to use `locals.safeGetSession()`
- ✅ Implemented user-friendly error messages using Supabase error codes
- ✅ Refactored database seeding into two-stage approach (user-independent → user-dependent)
- ✅ Moved events, races, and race results creation from seed.sql to seed-users.ts
- ✅ Fixed foreign key constraint errors in seeding workflow
- ✅ Migrated cyclist query to RPC function for better performance (11 JOINs → single optimized query)
- ✅ Implemented comprehensive i18n support with sveltekit-i18n
  - Automatic language detection from browser/cookies
  - Server-side and client-side translation support
  - Translation files organized by feature (common, auth, cyclists, events, account, panel)
  - Support for English and Spanish
- ✅ Refactored portal page into dedicated routes
  - `/panel` - Public cyclist profile display
  - `/account` - User account settings
  - Created reusable `CyclistProfile.svelte` component
- ✅ Added comprehensive test coverage
  - Unit tests for components (CyclistProfile.svelte)
  - E2E tests for account and panel pages

**Remaining Work:**

- Update remaining service layer (events, races) to use Supabase SDK
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

- Advanced search functionality for cyclists and events
- Admin dashboard for event/race management
- Real-time updates with WebSockets
- Image optimization and lazy loading
- Enhanced SEO with dynamic meta tags
- Email verification flow
- Password reset functionality
- More language support (Catalan, French, etc.)

**Potential Improvements:**

- Loading states with `+loading.svelte`
- Custom error pages with `+error.svelte`
- API route handlers with `+server.ts`
- Middleware for common logic
- Rate limiting for form submissions
- Always ask if I want to commit changes before do it
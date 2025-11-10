# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Amateur Cycling Stats UI is a SvelteKit application for managing amateur cycling statistics. The application uses **Supabase** as its backend (PostgreSQL database with Row Level Security, authentication, and real-time capabilities).

**Migration Status:** ✅ **COMPLETE** - Fully migrated from Next.js/Strapi to SvelteKit/Supabase with 100% feature parity

## Technology Stack

- **Framework**: SvelteKit 2.47.1 with Svelte 5 (using latest runes syntax)
- **Language**: TypeScript 5.9.3 (strict mode enabled)
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Styling**: Tailwind CSS 4.1.14
- **State**: Svelte Stores
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

5. **Keep hooks.server.ts Lightweight**
   - `hooks.server.ts` should be easy to read and maintain as it runs on every request
   - Extract utility functions to appropriate modules (`$lib/i18n/`, `$lib/utils/`, etc.)
   - Keep only the core logic: Supabase client setup, session management, locale detection

6. **Internationalization (i18n) for All User-Facing Text**
   - **NEVER** use hardcoded strings in user-facing components or error messages
   - All text must use translation keys via `$t()` (client) or `t(locale, key)` (server)
   - **Error messages in SvelteKit `error()` must use i18n**: `error(404, t(locale, 'feature.errors.notFound'))`
   - Organize translations by feature in `src/lib/i18n/locales/{locale}/{feature}.json`
   - Supported locales: `es` (Spanish - default), `en` (English)

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

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
    - `domain/` - **Domain entities** with camelCase properties
    - `services/` - Service response types
  - `adapters/` - **Transform DB types (snake_case) to domain types (camelCase)**
  - `services/` - API service functions (events, races, cyclists, users, auth)
  - `server/` - Server-side utilities (Supabase client creation)
  - `stores/` - Svelte stores for global state
  - `constants/` - Application constants
  - `utils/` - Utility functions
  - `i18n/` - Internationalization (sveltekit-i18n)
- **`src/routes/`** - SvelteKit file-based routing
  - `+layout.svelte` - Root layout wrapper with Header and GlobalAlert
  - `+layout.server.ts` - Server load function for user authentication state
  - `+page.svelte` - Route page components
  - `+page.server.ts` - Server-side data loading and form actions
- **`src/hooks.server.ts`** - SvelteKit server hooks for session management and Supabase client
- **`supabase/`** - Supabase configuration and migrations
  - `migrations/` - Database migration files (SQL)
  - `seed.sql` - User-independent seed data
  - `seed-users.ts` - User-dependent seed data (via Supabase Admin API)

### Route Structure

**Public Routes:**
- `/` - Home page with upcoming events
- `/results` - Past events listing with year filter
- `/results/[id]` - Event detail with race results and filters
- `/cyclists` - Cyclists listing
- `/cyclists/[id]` - Cyclist profile with race history
- `/teams` - Teams page (stub)
- `/ranking` - Ranking page (stub)

**Authentication Routes:**
- `/login` - Login page
- `/signin` - Registration page
- `/admin` - Admin dashboard (requires ADMIN role)
- `/panel` - Organizer panel (requires ORGANIZER role)
- `/account` - User account settings (requires authentication)

### Component Library

**Layout Components:**
- `Header.svelte` - Main navigation with authentication state
- `GlobalAlert.svelte` - Global error/notification system

**Navigation Components:**
- `MenuToolbar.svelte` - Unified navigation toolbar with hierarchical breadcrumbs, tabs, and actions
  - Two-level system: Primary (section nav) and Secondary (page nav)
  - See `src/lib/components/MenuToolbar.md` for comprehensive documentation

**UI Components:**
- `Button.svelte` - Reusable button component with consistent styling
  - Variants: `filled`, `outlined`, `text`
  - Colors: `primary` (blue), `secondary` (gray), `danger` (red), `success` (green)
  - Sizes: `sm`, `md` (default), `lg`
  - Features: `fullWidth` option, link mode (renders `<a>` when `href` provided)
  - Enhanced UX: pointer cursor, hover shadow, active press effect
  - Accessibility: supports `ariaLabel` and `ariaExpanded`
  - **Usage**: All button styling controlled via props only (no custom classes)

**Table Components:**
- `EventResultsTable.svelte` - Display events with date, name, location
- `ResultsTable.svelte` - Display race results with cyclist links
- `CyclistResultsTable.svelte` - Display cyclist's race history
- `OrganizationsTable.svelte` - Display organizations

**Profile Components:**
- `CyclistProfile.svelte` - Display cyclist profile information
- `OrganizationProfile.svelte` - Display organization information

**Form Components:**
- `SelectQueryParam.svelte` - URL-based filter dropdowns

### Service Layer

All services located in `src/lib/services/`:

1. **events.ts** - Event operations (getFutureEvents, getPastEvents, getEventWithCategoriesById)
2. **races.ts** - Race operations (getRaceWithResultsWithFilters)
3. **race-results.ts** - Race results operations (getRaceResultsByRaceId)
4. **cyclists.ts** - Cyclist operations (getCyclistWithResultsById, createCyclist)
5. **users.ts** - User operations (getMyself, updateUser)
6. **users-management.ts** - Authentication (login, signin)
7. **roles.ts** - Role management (getRoles)

### Key Patterns

**Server-Side Rendering (SSR):**
- All pages use `+page.server.ts` for data loading
- Data fetched on the server for SEO and performance
- No client-side data fetching with `onMount`

**Form Actions (Progressive Enhancement):**
- Forms use SvelteKit form actions for POST requests
- Work without JavaScript, enhanced with `use:enhance`
- Server-side validation and error handling

**Authentication & Session Management:**
- Supabase Auth with automatic cookie management via `@supabase/ssr`
- Server-side session handling in `hooks.server.ts`
- `event.locals.safeGetSession()` helper validates JWT with Auth server
- Returns enriched user data via `get_user_with_relations()` RPC
- Protected routes redirect to `/login` if not authenticated

**Graceful Error Handling:**
- Services distinguish between expected "not found" vs unexpected errors
- Return `null` for expected missing data (e.g., PGRST116 "no rows found")
- Throw errors only for unexpected database issues
- UI handles `null` gracefully with user-friendly messages

**Type System Architecture (CRITICAL RULES):**

1. **Database Type Aliases (src/lib/types/db/) - REQUIRED**
   - **CRITICAL**: ALWAYS use explicit DB type aliases instead of `Tables<'table_name'>`
   - Naming convention: `TableNameDB` (e.g., `CyclistDB`, `EventDB`, `RaceDB`)
   - All DB types are exported from `$lib/types/db` for easy imports

2. **Adapter Layer (src/lib/adapters/)**
   - **REQUIRED** for all Supabase service methods
   - Transforms snake_case DB fields → camelCase domain fields
   - Common utilities in `common.adapter.ts`
   - Entity-specific adapters in separate files

3. **Service Layer Pattern**
   - Services work with Supabase SDK using DB type aliases
   - **ALWAYS** use adapters to transform results to domain types
   - Return domain types (camelCase) to consumers

**State Management:**
- Svelte stores for global state
- Component-level `$state` runes for local reactive state
- `$derived` runes for computed values
- `$effect` runes for side effects

**Component Structure (Svelte 5):**
- TypeScript script blocks with explicit type annotations
- Svelte 5 runes syntax (`$props`, `$state`, `$derived`, `$effect`)
- Tailwind utility classes for styling
- Progressive enhancement with `use:enhance` directive

**Button Usage Guidelines:**
- **ALWAYS** use the `Button` component for interactive buttons and button-like links
- **NEVER** create custom button implementations with inline styles
- Use appropriate variant: `filled` for primary actions, `outlined` for secondary, `text` for tertiary
- Choose correct color: `primary` (blue), `secondary` (gray), `danger` (destructive), `success` (positive)
- Select proper size: `sm` (navigation), `md` (forms/default), `lg` (hero sections)
- Standard inline text links (e.g., in tables) can remain as plain `<a>` tags

## Supabase Integration

### Database Configuration

Configuration stored in `.env`:

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (server-only)
```

### Database Migrations

All schema changes managed through Supabase migrations located in `supabase/migrations/`.

**Migration Commands:**

```bash
# Create new migration
supabase migration new migration_name

# Push migrations to remote
supabase db push

# Regenerate TypeScript types
supabase gen types typescript --linked > src/lib/types/database.types.ts
```

**IMPORTANT:** Always regenerate types after schema changes!

### Seeding Test Data

The project uses a **two-stage seeding approach**:

**Stage 1: User-Independent Data (SQL)**
- Run automatically during `supabase db reset`
- Defined in `supabase/seed.sql`
- Creates: Organizations, unlinked cyclists, ranking systems

**Stage 2: User-Dependent Data (TypeScript)**
- Run manually via `npm run seed:users`
- Uses Supabase Admin API
- Defined in `supabase/seed-users.ts`
- Creates: Test users, events, races, results

**Seeding Workflow:**

```bash
# 1. Reset database (runs migrations + seed.sql automatically)
supabase db reset --linked --yes

# 2. Seed users and user-dependent data
npm run seed:users
```

**Test User Credentials:**

- Admin: `admin@acs.com` / `#admin123`
- Organizer Admin: `organizer@example.com` / `password123`
- Organizer Staff: `staff@example.com` / `password123`
- Cyclist 1: `cyclist1@example.com` / `password123`
- Cyclist 2: `cyclist2@example.com` / `password123`
- Cyclist 3: `cyclist3@example.com` / `password123`

### Row Level Security (RLS)

- All tables have RLS enabled
- Role-based policies (PUBLIC, CYCLIST, ORGANIZER_STAFF, ORGANIZER_ADMIN, ADMIN)
- Organization-based access control
- Helper functions: `is_admin()`, `is_organizer()`, `is_organizer_admin()`, `is_in_event_organization()`

## Domain Model

### Core Entities

**Authentication & Authorization:**
- **User** - Authenticated users linked to Supabase Auth
- **Role** - User roles (5 types: PUBLIC, CYCLIST, ORGANIZER_STAFF, ORGANIZER_ADMIN, ADMIN)
- **Organization** - Companies/clubs that organize events
- **Organizer** - Junction table linking users to organizations

**Events & Races:**
- **Event** - Cycling event owned by an organization
- **Race** - Individual race within an event
- **RaceResult** - Performance record linking cyclist to race

**Athletes:**
- **Cyclist** - Athlete profile (nullable user_id for unregistered athletes)

**Reference Data:**
- **RaceCategory** - Age/experience categories (26 types)
- **RaceCategoryGender** - Gender categories (FEMALE, MALE, OPEN)
- **RaceCategoryLength** - Distance types (LONG, SHORT, SPRINT, UNIQUE)
- **RaceRanking** - Ranking systems (UCI, NATIONAL, REGIONAL, CUSTOM)
- **CyclistGender** - Cyclist genders (M, F)
- **RankingPoint** - Points awarded per place

### Business Rules

**Event Status Flow:**
- DRAFT → AVAILABLE → SOLD_OUT → ON_GOING → FINISHED

**User Roles & Permissions:**
- `PUBLIC` - Anonymous visitors (read-only for public content)
- `CYCLIST` - Default role for new signups
- `ORGANIZER_STAFF` - Limited admin access (create/edit results for org's events)
- `ORGANIZER_ADMIN` - Full org access (manage events, races, results)
- `ADMIN` - System administrator (full access)

**Visibility Rules:**
- Events/Races have independent `is_public_visible` flags
- Public users only see content where both event AND race are public
- Organization members see all their org's content
- Admins see everything

## Development Best Practices

**When Adding New Pages:**
1. Create `+page.svelte` for the UI
2. Create `+page.server.ts` for SSR data loading
3. Use `PageServerLoad` type from `./$types`
4. Add form actions if page has forms
5. Handle errors with SvelteKit's `error()` helper
6. Add `<svelte:head>` for SEO meta tags

**When Adding New Components:**
1. Use `.svelte` extension
2. Use Svelte 5 runes syntax
3. Add TypeScript type annotations
4. Use Tailwind CSS for styling
5. Place in `src/lib/components/` directory

**When Adding New Services:**
1. Place in `src/lib/services/` directory
2. Add proper TypeScript types
3. Use adapters to transform DB → Domain types
4. Handle errors appropriately
5. Import DB types from `$lib/types/db`

**Authentication Pattern:**

```typescript
// In +page.server.ts
export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw redirect(302, '/login');
	return { user };
};
```

**Form Action Pattern:**

```typescript
// In +page.server.ts
export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		// Validation and processing
		return { success: true };
	}
};
```

**Page Layout Best Practices:**

The root layout provides centralized horizontal padding and max-width:

```html
<main class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
	{@render children()}
</main>
```

**Rules:**
1. **NEVER add horizontal padding (`px-*`)** - Layout provides it
2. **ONLY add vertical padding (`py-*`)** - Pages control vertical spacing
3. **NEVER add `max-w-*`** - Layout provides it
4. **NEVER duplicate horizontal spacing** - Creates misalignment

## Common Gotchas

1. **Don't use `onMount` for data fetching** - Use `+page.server.ts` instead
2. **Don't forget `use:enhance`** - Always add to forms for progressive enhancement
3. **Import from `$lib`** - Use path alias instead of relative imports
4. **Use proper TypeScript types** - Import from `./$types` for load functions
5. **Handle authentication in server code** - Never expose JWT to client
6. **Use `goto()` for client-side navigation** - Use `redirect()` for server-side

## Migration Context

The application has been fully migrated from **Next.js/Strapi** to **SvelteKit/Supabase** with 100% feature parity and significant improvements:

**Frontend:** Next.js → SvelteKit with Svelte 5, Material-UI → Tailwind CSS v4
**Backend:** Strapi CMS → Supabase (PostgreSQL + Auth + RLS)
**Auth:** next-auth → Supabase Auth with SSR
**i18n:** next-intl → sveltekit-i18n

**Key Improvements:**
- 100% server-side rendering
- Type-safe throughout with strict TypeScript
- Comprehensive Row Level Security
- Auto-generated database types
- Dual-field ID system (UUID + NanoID)
- Two-stage seeding approach
- Performance optimized RPC functions

For migration details, see git history and `supabase/migrations/`.

## Future Enhancements

- Advanced search functionality
- Real-time updates with WebSockets
- Image optimization and lazy loading
- Enhanced SEO with dynamic meta tags
- Email verification flow
- Password reset functionality
- More language support (Catalan, French, etc.)
- Loading states with `+loading.svelte`
- Custom error pages with `+error.svelte`
- Rate limiting for form submissions

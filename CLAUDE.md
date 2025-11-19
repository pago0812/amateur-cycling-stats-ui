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

4. **UUID-Based ID Architecture**
   - **All IDs use PostgreSQL UUIDs** (generated via `gen_random_uuid()`)
   - **Database stores single `id` field**: UUID as primary key
   - **Domain layer uses `id: string`** (receives UUID value from adapters)
   - **Adapters translate at DB boundary**: `db.id` → `domain.id`

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

7. **Role Constants Standardization (UPPERCASE with ENUM)**
   - **CRITICAL**: All role constants use UPPERCASE_SNAKE_CASE format throughout the entire system
   - **Database Layer**: PostgreSQL `role_name_enum` ENUM type with values: `'PUBLIC'`, `'CYCLIST'`, `'ORGANIZER_STAFF'`, `'ORGANIZER_OWNER'`, `'ADMIN'`
   - **Application Layer**: TypeScript `RoleTypeEnum` enum with matching UPPERCASE values
   - **NEVER use string literals** for role comparisons - ALWAYS use `RoleTypeEnum`
   - **Database comparisons MUST use ENUM casts**: `WHERE name = 'CYCLIST'::role_name_enum`
   - **Type Safety**: Both database and TypeScript enforce valid role values at compile/runtime

   **Examples:**

   ```typescript
   // ✅ CORRECT - Use RoleTypeEnum
   if (user.roleType === RoleTypeEnum.CYCLIST) {
   }
   if (
   	user.roleType === RoleTypeEnum.ORGANIZER_OWNER ||
   	user.roleType === RoleTypeEnum.ORGANIZER_STAFF
   ) {
   }

   // ❌ WRONG - Never use string literals
   if (user.roleType === 'cyclist') {
   }
   if (user.roleType === 'CYCLIST') {
   }
   ```

   **Database examples:**

   ```sql
   -- ✅ CORRECT - Use ENUM cast
   WHERE r.name = 'CYCLIST'::role_name_enum
   WHERE r.name IN ('ORGANIZER_STAFF'::role_name_enum, 'ORGANIZER_OWNER'::role_name_enum)

   -- ❌ WRONG - Never use string literals without cast
   WHERE r.name = 'CYCLIST'
   WHERE r.name = 'cyclist'
   ```

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
- `/auth/callback` - OAuth/invitation callback handler
- `/auth/complete-setup` - Complete organization owner profile after invitation
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

1. **events.ts** - Event operations (getFutureEvents, getPastEvents, getEventWithRacesById)
2. **races.ts** - Race operations (getRaceWithResultsWithFilters)
3. **race-results.ts** - Race results operations (getRaceResultsByRaceId)
4. **cyclists.ts** - Cyclist operations (getCyclistById - fetches cyclist without race results, pair with getRaceResultsByUserId for parallel fetching)
5. **users.ts** - User operations (getAuthUser, isAuthenticated)
6. **users-management.ts** - User creation & authentication (login, signin)
7. **roles.ts** - Role management (getRoles)
8. **organizations.ts** - Organization operations (getAllOrganizations, getOrganizationById, createOrganization, updateOrganization, updateOrganizationState, deleteOrganization, deactivateOrganization, activateOrganization, permanentlyDeleteOrganization)
9. **organization-invitations.ts** - Invitation operations (createInvitation, getInvitationByEmail, getInvitationByOrganizationId, updateInvitationStatus, incrementRetryCount, deleteInvitationByOrganizationId)
10. **auth-admin.ts** - Supabase Admin API operations (checkUserExists, generateInvitationLink, deleteAuthUserById, createOnBehalfOrganizerOwner)
11. **mailersend.ts** - Email sending via MailerSend API (sendInvitationEmail)

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
- `event.locals.getSessionUser()` helper validates session and returns User or null
- Returns enriched user data via `get_auth_user()` RPC
- Protected routes redirect to `/login` if not authenticated

**Session Optimization Pattern (CRITICAL):**

- **Root layout ONLY** (`/src/routes/+layout.server.ts`) calls `getSessionUser()`
- **All nested layouts/pages** use `parent()` to access user from root layout
- **Exception**: Form actions may call `getSessionUser()` when state changes (e.g., after login)
- **Performance**: 1 database call per request instead of 7+ calls
- **Never** call `getSessionUser()` in nested routes - always use parent data

**Examples:**

```typescript
// ✅ CORRECT - Root layout calls getSessionUser()
// /src/routes/+layout.server.ts
export const load: LayoutServerLoad = async ({ locals, url }) => {
	const user = await locals.getSessionUser();
	return { user, locale: locals.locale };
};

// ✅ CORRECT - Nested layout uses parent()
// /src/routes/admin/+layout.server.ts
export const load: LayoutServerLoad = async ({ parent }) => {
	const { user } = await parent();
	if (!user) throw redirect(302, '/login');
	return { user };
};

// ✅ CORRECT - Page uses parent()
// /src/routes/account/+page.server.ts
export const load: PageServerLoad = async ({ parent, locals }) => {
	const { user } = await parent();
	// ... use user
};

// ✅ CORRECT - Form action calls getSessionUser() (state changed)
// /src/routes/login/+page.server.ts
export const actions = {
	default: async ({ request, locals }) => {
		// Login happens here...
		const user = await locals.getSessionUser(); // State changed!
		throw redirect(302, getRedirectUrl(user?.roleType));
	}
};

// ❌ WRONG - Nested layout calling getSessionUser()
export const load: LayoutServerLoad = async ({ locals }) => {
	const user = await locals.getSessionUser(); // DON'T DO THIS!
	// Use parent() instead!
};
```

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
# Application Configuration
SITE_URL=http://127.0.0.1:5173  # Your app's URL (used for auth callbacks)

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important**: All environment variables are server-only and imported from `$env/static/private` in SvelteKit. The project does NOT use `PUBLIC_` prefixed variables to ensure credentials are never exposed to the client.

**Note**: `SITE_URL` must match the actual URL where your application is running. In production, this should be your production domain (e.g., `https://yourdomain.com`).

### Database Migrations

All schema changes managed through Supabase migrations located in `supabase/migrations/`.

**CRITICAL:** Always work with the **LOCAL** database during development. DO NOT reset or push to the remote/linked database without explicit user approval.

**Migration Strategy:**

**🚨 EDIT EXISTING MIGRATIONS (Default Mode)**

- **DO NOT** create new migration files for fixes or changes during active development
- **ALWAYS** edit the existing consolidated migration files directly
- After editing, run `supabase db reset` to apply changes
- This keeps migration history clean and manageable
- Switch to "add new migrations" mode only when user explicitly requests it

**Migration Commands:**

```bash
# Edit existing migration (DEFAULT - use this during development)
# 1. Edit the migration file directly
# 2. Reset local database
supabase db reset

# Create new migration (ONLY when user explicitly requests)
supabase migration new migration_name

# Apply migrations to LOCAL database
supabase db reset

# Push migrations to remote (ONLY when user explicitly requests)
supabase db push --linked

# Regenerate TypeScript types from LOCAL database
supabase gen types typescript --local > src/lib/types/database.types.ts

# Regenerate TypeScript types from LINKED/remote database (only when needed)
supabase gen types typescript --linked > src/lib/types/database.types.ts
```

**Development Workflow (Edit Mode - DEFAULT):**

1. **Edit existing migration file** in `supabase/migrations/`
2. Apply to local DB: `supabase db reset`
3. Regenerate types: `supabase gen types typescript --local > src/lib/types/database.types.ts`
4. Test locally
5. **Only after user approval**: `supabase db push --linked`

**Alternative Workflow (Add Mode - only when requested):**

1. Create migration: `supabase migration new migration_name`
2. Apply to local DB: `supabase db reset`
3. Regenerate types: `supabase gen types typescript --local > src/lib/types/database.types.ts`
4. Test locally
5. **Only after user approval**: `supabase db push --linked`

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

### MailerSend Integration

**Custom Email Solution for Organization Invitations:**

The application uses **MailerSend** for sending organization owner invitations instead of Supabase's built-in email system. This provides:

- Full control over email templates and branding
- Better deliverability and analytics
- Ability to resend invitations without "user exists" errors
- Gradual migration path for other email types

**Environment Variables:**

```env
# MailerSend API Configuration
MAILERSEND_API_KEY=your_mailersend_api_key_here
MAILERSEND_FROM_EMAIL=noreply@yourdomain.com  # Must be verified in MailerSend
MAILERSEND_FROM_NAME=Amateur Cycling Stats
```

**Email Templates:**

Templates located in `src/lib/templates/email/`:

- `invitation.html` - Responsive HTML email template
- `invitation.txt` - Plain text fallback for accessibility
- `README.md` - Template documentation and customization guide

**Template Variables:**

- `{{organization_name}}` - Name of the organization
- `{{owner_name}}` - Full name of invited owner
- `{{confirmation_url}}` - Complete setup URL with auth token
- `{{site_url}}` - Base application URL

**Invitation Flow:**

**Creating Organization (First Invitation):**

1. Admin creates organization → state set to `WAITING_OWNER`
2. Auth user created with `skip_auto_create` metadata flag
3. Public user created with `organizer_owner` role via RPC function `create_user_with_organizer_owner()`
4. Invitation record created in `organization_invitations` table
5. Invitation link generated via `generateInvitationLink()`
6. Email sent via MailerSend API with custom template

**Resending Invitation:**

1. Admin clicks "Resend Invitation" for WAITING_OWNER organization
2. New invitation link generated for existing auth user (no "user exists" error!)
3. Email sent via MailerSend with fresh link
4. Retry count incremented in invitation record

**User Creation Patterns:**

The application uses **role-specific RPC functions** for creating users:

- `create_user_with_organizer_owner()` - Creates organizer owner + links to organization

These functions handle:

- Creating or updating public.users with correct role
- Cleaning up auto-created cyclist profiles if role changes
- Creating necessary relationships (organizers, cyclists)
- All in one atomic transaction

**Database Trigger:**

The `handle_new_user()` trigger supports skipping auto-creation via `skip_auto_create` metadata flag. This allows manual user creation flows while maintaining backwards compatibility with normal signup.

### Row Level Security (RLS)

- All tables have RLS enabled
- Role-based policies (PUBLIC, CYCLIST, ORGANIZER_STAFF, ORGANIZER_OWNER, ADMIN)
- Organization-based access control
- Helper functions: `is_admin()`, `is_organizer()`, `is_organizer_admin()`, `is_in_event_organization()`
- **organization_invitations** - Readable/writable by admins only

## Domain Model

### Core Entities

**Authentication & Authorization:**

- **User** - Authenticated users linked to Supabase Auth
- **Role** - User roles (5 types: PUBLIC, CYCLIST, ORGANIZER_STAFF, ORGANIZER_OWNER, ADMIN)
- **Organization** - Companies/clubs that organize events (state: WAITING_OWNER, ACTIVE, DISABLED)
- **OrganizationInvitation** - Tracks pending owner invitations with retry mechanism
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
- `ORGANIZER_OWNER` - Full org access (manage events, races, results)
- `ADMIN` - System administrator (full access)

**Visibility Rules:**

- Events/Races have independent `is_public_visible` flags
- Public users only see content where both event AND race are public
- Organization members see all their org's content
- Admins see everything

**Organization States:**

- `WAITING_OWNER` - Organization created, pending owner invitation acceptance
- `ACTIVE` - Organization operational, owner has completed setup
- `DISABLED` - Organization soft-deleted or invitation expired

**Organization Owner Invitation Flow:**

1. **Admin creates organization** with owner email and name
2. **System creates** organization with `state = WAITING_OWNER` and invitation record
3. **Supabase sends** invitation email via Admin API to prospective owner
4. **Owner clicks link** → redirected to `/auth/callback` → `/auth/complete-setup`
5. **Owner completes setup** with first name, last name, and password
6. **System creates** user record with `ORGANIZER_OWNER` role
7. **System links** user to organization via organizer record
8. **System updates** organization `state = ACTIVE` and invitation `status = accepted`
9. **Retry mechanism**: If not accepted within 7 days, system resends invitation (max 3 retries)
10. **After 3 retries** (21 days total), organization `state = DISABLED`

**Important Rules:**

- Organizers cannot be cyclists (separate accounts required)
- No account merging during invitation (email must not exist)
- Password setup required immediately after invitation acceptance
- Admin can manually resend invitation for `WAITING_OWNER` organizations

## Development Best Practices

**When Adding New Pages:**

1. Create `+page.svelte` for the UI
2. Create `+page.server.ts` for SSR data loading
3. Use `PageServerLoad` type from `./$types`
4. **IMPORTANT**: Use `parent()` to get user data (never call `getSessionUser()` directly)
5. Add form actions if page has forms
6. Handle errors with SvelteKit's `error()` helper
7. Add `<svelte:head>` for SEO meta tags

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

**Session Management Pattern:**

```typescript
// ✅ CORRECT - Get user from parent layout (most common case)
// In +page.server.ts or nested +layout.server.ts
export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent(); // User already fetched by root layout
	if (!user) throw redirect(302, '/login');
	return { user };
};

// ✅ CORRECT - Form action after state change (e.g., after login)
export const actions = {
	default: async ({ request, locals }) => {
		// Login/signup happens here...
		const user = await locals.getSessionUser(); // State changed!
		throw redirect(302, '/dashboard');
	}
};

// ❌ WRONG - Don't call getSessionUser() in nested routes
export const load: PageServerLoad = async ({ locals }) => {
	const user = await locals.getSessionUser(); // DON'T DO THIS!
	// Use parent() instead for better performance
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
<main class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{@render children()}</main>
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

## Advanced Patterns

### Atomic Database Operations Pattern

**When to Use**: Complex multi-step operations that must succeed or fail together

**Pattern**: Create PostgreSQL RPC functions that combine multiple operations in a single transaction.

**Example**: `complete_organizer_owner_setup()` RPC function

```sql
CREATE OR REPLACE FUNCTION public.complete_organizer_owner_setup(
  p_auth_user_id UUID,
  p_first_name TEXT,
  p_last_name TEXT,
  p_invitation_email TEXT
)
RETURNS JSONB
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Multiple operations in one transaction
  -- 1. Validate invitation
  -- 2. Update user profile
  -- 3. Link to organization
  -- 4. Accept invitation
  -- 5. Activate organization

  RETURN jsonb_build_object('success', true, 'organization_id', v_organization_id);
END;
$$;
```

**Benefits**:

- ✅ **Atomic**: All steps succeed or all fail (no partial updates)
- ✅ **Fast**: Single database round-trip instead of multiple queries
- ✅ **Maintainable**: Business logic centralized in database
- ✅ **Type-safe**: Return JSONB with explicit structure

**Application Code**:

```typescript
// Single RPC call handles all database operations
const { data, error } = await supabase.rpc('complete_organizer_owner_setup', {
	p_auth_user_id: authUser.id,
	p_first_name: firstName,
	p_last_name: lastName,
	p_invitation_email: email
});

// Type cast JSONB result (Supabase doesn't auto-infer JSONB structures)
const result = data as {
	success: boolean;
	organization_id: string;
};
```

### Email Integration Pattern (MailerSend)

**When to Use**: Custom transactional emails with full control over templates and delivery

**Why Not Supabase Auth Emails**:

- Need custom branding and templates
- Better deliverability and analytics
- Ability to resend without "user exists" errors
- Support for multiple email types in one system

**Environment Variables**:

```env
MAILERSEND_API_KEY=your_api_key
MAILERSEND_FROM_EMAIL=noreply@yourdomain.com
MAILERSEND_FROM_NAME=Amateur Cycling Stats
```

**Email Templates**: Located in `src/lib/templates/email/`

- `*.html` - Responsive HTML email
- `*.txt` - Plain text fallback
- `README.md` - Template documentation

**Template Variables**: Use `{{variable_name}}` syntax

```html
<p>Hello {{owner_name}},</p>
<p>You've been invited to join {{organization_name}}</p>
<a href="{{confirmation_url}}">Complete Setup</a>
```

**Service Implementation**:

```typescript
// src/lib/services/mailersend.ts
export async function sendInvitationEmail(params: {
	toEmail: string;
	toName: string;
	organizationName: string;
	confirmationUrl: string;
}) {
	// Load templates
	const htmlTemplate = await readFile('src/lib/templates/email/invitation.html', 'utf-8');
	const textTemplate = await readFile('src/lib/templates/email/invitation.txt', 'utf-8');

	// Replace variables
	const html = htmlTemplate
		.replace(/\{\{owner_name\}\}/g, params.toName)
		.replace(/\{\{organization_name\}\}/g, params.organizationName)
		.replace(/\{\{confirmation_url\}\}/g, params.confirmationUrl);

	// Send via MailerSend API
	await fetch('https://api.mailersend.com/v1/email', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${MAILERSEND_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ from, to, subject, html, text })
	});
}
```

### Organization Owner Invitation Flow Pattern

**Complete Flow**: Admin invites owner → Email sent → Owner accepts → Setup complete

**1. Admin Creates Organization (with invitation)**:

```typescript
// Create organization with WAITING_OWNER state
const org = await createOrganization(supabase, {
	name: 'Pro Cycling League',
	state: 'WAITING_OWNER'
});

// Create auth user with skip_auto_create flag
const { user } = await supabase.auth.admin.createUser({
	email: ownerEmail,
	user_metadata: {
		first_name: ownerFirstName,
		last_name: ownerLastName,
		skip_auto_create: true, // Skip automatic cyclist role assignment
		organizationId: org.id
	}
});

// Create public user with organizer_owner role (via RPC)
await supabase.rpc('create_user_with_organizer_owner', {
	p_auth_user_id: user.id,
	p_first_name: ownerFirstName,
	p_last_name: ownerLastName,
	p_organization_id: org.id
});

// Create invitation record
await createInvitation(supabase, {
	organizationId: org.id,
	email: ownerEmail,
	invitedOwnerName: `${ownerFirstName} ${ownerLastName}`
});

// Generate invitation link
const inviteLink = await generateInvitationLink(email);

// Send email via MailerSend
await sendInvitationEmail({
	toEmail: ownerEmail,
	toName: ownerFirstName,
	organizationName: org.name,
	confirmationUrl: inviteLink
});
```

**2. Owner Clicks Invitation Link**:

- Redirects to `/auth/callback` with access/refresh tokens
- Server sets session via `supabase.auth.setSession()`
- Detects `organizationId` in user metadata → redirects to `/auth/complete-setup`

**3. Owner Completes Setup**:

```typescript
// /auth/complete-setup/+page.server.ts (form action)

// 1. Update password (Auth API - cannot be in database transaction)
await supabase.auth.updateUser({ password });

// 2. Complete all database operations atomically
const { data } = await supabase.rpc('complete_organizer_owner_setup', {
	p_auth_user_id: authUser.id,
	p_first_name: firstName,
	p_last_name: lastName,
	p_invitation_email: email
});

// This single RPC call does:
// - Updates public.users (first_name, last_name)
// - Links user to organization (creates organizer record)
// - Updates user role to organizer_owner
// - Marks invitation as 'accepted'
// - Changes organization state to 'ACTIVE'

// 3. Redirect to organization page
throw redirect(303, `/admin/organizations/${data.organization_id}`);
```

**4. RLS Policies for Invitation Flow**:

```sql
-- Allow invited users to view WAITING_OWNER organizations
-- Helper function bypasses RLS on invitations table
CREATE FUNCTION user_has_active_invitation(org_id UUID)
RETURNS BOOLEAN SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_invitations oi
    JOIN auth.users au ON oi.email = au.email
    WHERE oi.organization_id = org_id
      AND au.id = auth.uid()
      AND oi.status IN ('pending', 'accepted')
  );
$$;

CREATE POLICY "Invited users can view organizations with active invitations"
  ON organizations FOR SELECT
  USING (state = 'WAITING_OWNER' AND user_has_active_invitation(id));
```

**Key Design Decisions**:

- **SECURITY DEFINER** helper functions bypass RLS for invitation checks
- **Accept both 'pending' and 'accepted'** status during setup (transient state)
- **Atomic RPC** ensures all setup steps succeed or fail together
- **Password update separate** (Auth API cannot be in DB transaction)

### SvelteKit Redirect Handling Pattern

**Problem**: SvelteKit's `redirect()` throws a `Redirect` object, not a `Response`

**Wrong Pattern** ❌:

```typescript
try {
	throw redirect(303, '/somewhere');
} catch (err) {
	if (err instanceof Response) {
		// This never matches!
		throw err;
	}
}
```

**Correct Pattern** ✅:

```typescript
try {
	throw redirect(303, '/somewhere');
} catch (err) {
	// Use duck typing to detect redirects
	if (err && typeof err === 'object' && 'status' in err && 'location' in err) {
		throw err; // Re-throw the redirect
	}
	// Handle actual errors
	console.error('Error:', err);
}
```

**Why**: The `Redirect` object has `status` and `location` properties but is not a `Response` instance. Duck typing checks for the properties that define a redirect.

**Works for all redirect codes**: 301, 302, 303, 307, 308

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
- UUID-based ID system throughout
- Two-stage seeding approach
- Performance optimized RPC functions

For migration details, see git history and `supabase/migrations/`.

## Recent Enhancements

**Cyclist Type System Cleanup** ✅ (January 2025)

- Removed legacy `CyclistOld` and `CyclistWithRelations` types
- Removed deprecated `adaptCyclistFromDb` and `adaptCyclistWithResultsFromDb` adapters
- Removed deprecated `createCyclist` service function
- Simplified to single `Cyclist` domain type with flat structure
- Optimized data fetching: `getCyclistById` + `getRaceResultsByUserId` with `Promise.all`
- Reduced codebase by ~500 lines while maintaining full functionality

**Organization Owner Invitation System** ✅ (Implemented)

- Email-based owner invitations via Supabase Auth
- Organization state management (WAITING_OWNER, ACTIVE, DISABLED)
- Automatic retry mechanism with manual resend option
- Complete profile setup flow for invited owners
- Admin can create organizations with pending owner setup

## Future Enhancements

- **Invitation Retry Automation** - Supabase Edge Function for automated retry mechanism
- Advanced search functionality
- Real-time updates with WebSockets
- Image optimization and lazy loading
- Enhanced SEO with dynamic meta tags
- Full email verification flow for regular signups
- Password reset functionality
- More language support (Catalan, French, etc.)
- Loading states with `+loading.svelte`
- Custom error pages with `+error.svelte`
- Rate limiting for form submissions

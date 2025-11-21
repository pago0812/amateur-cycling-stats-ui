<!--
SYNC IMPACT REPORT
Version: 1.1.0 → 1.2.0 (MINOR - Added new principles and expanded guidance)
Ratification Date: 2025-11-18
Last Amended: 2025-11-20

Modified Principles:
- VIII. CRUD Patterns Standardization → Expanded with MenuToolbar pattern details
- Added new principle XI. shadcn-svelte UI Components (new section)
- Added new principle XII. MenuToolbar Navigation Pattern (new section)

Added Sections:
- Principle XI: shadcn-svelte UI Components - Mandatory use of shadcn-svelte when available
- Principle XII: MenuToolbar Navigation Pattern - Key navigation component for admin/panel/account routes
- Enhanced Section VIII with specific MenuToolbar integration requirements

Removed Sections: None

Templates Status:
✅ plan-template.md - Reviewed and aligned with constitution principles
✅ spec-template.md - Reviewed and aligned with user story requirements
✅ tasks-template.md - Reviewed and aligned with task organization principles
✅ checklist-template.md - Reviewed for quality gates alignment

Follow-up TODOs:
- None - all changes integrated into constitution
-->

# Amateur Cycling Stats UI Constitution

## Core Principles

### I. Svelte 5 Syntax Mandatory (NON-NEGOTIABLE)

This project uses **Svelte 5 ONLY** - never Svelte 4 syntax.

**Rules:**

- ✅ MUST use `$props()` for component props
- ✅ MUST use `$state()` for reactive state
- ✅ MUST use `$derived()` for computed values
- ✅ MUST use `$effect()` for side effects
- ✅ MUST use `{@render children()}` for slot content
- ✅ MUST use `children: Snippet` type for layout children
- ❌ NEVER use `export let` for props (Svelte 4 syntax)
- ❌ NEVER use `<slot />` (deprecated in Svelte 5)
- ❌ NEVER use `$:` reactive statements (use `$derived` or `$effect` instead)

**Rationale:** Svelte 5 provides better type safety, clearer reactivity semantics, and improved performance. Mixing Svelte 4 and 5 syntax creates confusion and breaks compilation.

### II. Zero `any` Types Policy (NON-NEGOTIABLE)

**NEVER** use `any` type in the codebase. All types must be explicit and type-safe.

**Rules:**

- ✅ MUST use explicit Supabase response types for complex queries
- ✅ MUST use explicit DB type aliases (e.g., `EventDB`, `RaceDB`)
- ✅ MUST use type casting for JSONB RPC responses
- ❌ NEVER use `any` in function parameters, return types, or variables
- ❌ NEVER use `as any` to bypass type checking

**Rationale:** Type safety prevents runtime errors, improves developer experience, and enables better refactoring. The `any` type defeats the purpose of TypeScript.

### III. Domain Types Architecture (NON-NEGOTIABLE)

All domain entities use **camelCase** properties. Database types (snake_case) are ONLY used in services and adapters.

**Rules:**

- ✅ MUST use domain types (camelCase) throughout components, pages, and stores
- ✅ MUST use `id` field ONLY for all domain entities (no `documentId`, no dual naming)
- ✅ MUST use DB type aliases (`TableNameDB`) instead of `Tables<'table_name'>`
- ✅ MUST use adapters to transform DB types → domain types at service boundary
- ❌ NEVER expose snake_case DB fields to UI components
- ❌ NEVER mix camelCase and snake_case in the same layer

**Rationale:** Clear separation between database representation and domain model prevents coupling, improves testability, and makes the codebase more maintainable.

### IV. UUID-Based ID Architecture

All IDs use PostgreSQL UUIDs (generated via `gen_random_uuid()`).

**Rules:**

- ✅ Database stores single `id` field: UUID as primary key
- ✅ Domain layer uses `id: string` (receives UUID value from adapters)
- ✅ Adapters translate at DB boundary: `db.id` → `domain.id`
- ❌ NEVER use auto-increment integers for public-facing IDs
- ❌ NEVER expose internal database IDs in URLs (use short_id or UUID)

**Rationale:** UUIDs prevent enumeration attacks, enable distributed ID generation, and avoid ID conflicts in multi-database scenarios.

### V. Session Optimization Pattern (CRITICAL)

**Root layout ONLY** calls `getSessionUser()`. All nested layouts/pages use `parent()` to access user from root layout.

**Rules:**

- ✅ Root layout (`/src/routes/+layout.server.ts`) MUST call `getSessionUser()`
- ✅ Nested layouts/pages MUST use `parent()` to access user data
- ✅ Form actions MAY call `getSessionUser()` when state changes (e.g., after login)
- ❌ NEVER call `getSessionUser()` in nested routes
- ❌ NEVER duplicate session fetching

**Rationale:** Performance optimization - 1 database call per request instead of 7+ calls. Prevents unnecessary RPC invocations and reduces latency.

### VI. Internationalization (i18n) Mandatory

**NEVER** use hardcoded strings in user-facing components or error messages.

**Rules:**

- ✅ MUST use `$t()` (client) or `t(locale, key)` (server) for all user-facing text
- ✅ Error messages in SvelteKit `error()` MUST use i18n: `error(404, t(locale, 'feature.errors.notFound'))`
- ✅ MUST organize translations by feature: `src/lib/i18n/locales/{locale}/{feature}.json`
- ✅ Supported locales: `es` (Spanish - default), `en` (English)
- ❌ NEVER use hardcoded strings like "Email is required"
- ❌ NEVER use string concatenation for translations

**Rationale:** Ensures application can support multiple languages, improves accessibility, and centralizes text management.

### VII. Type System with Adapters (REQUIRED)

ALWAYS use explicit DB type aliases and adapters for all Supabase service methods.

**Rules:**

- ✅ MUST use DB type aliases: `TableNameDB` (e.g., `CyclistDB`, `EventDB`)
- ✅ MUST use adapters to transform snake_case → camelCase at service boundary
- ✅ MUST return domain types (camelCase) to consumers
- ✅ MUST export all DB types from `$lib/types/db` for easy imports
- ❌ NEVER use `Tables<'table_name'>` directly
- ❌ NEVER skip adapter transformation

**Rationale:** Explicit type aliases improve readability, adapters ensure consistent transformation, and domain types decouple UI from database schema.

### VIII. Service Layer Architecture (CRITICAL RULE)

**NEVER** call `supabase.rpc()` or `supabase.from()` directly from page.server.ts or layout.server.ts files. **ALWAYS** use service layer functions that encapsulate database operations.

**Architecture Pattern:**

```
Page/Layout Server Files (routes/)
        ↓ calls service (domain types)
Service Layer (src/lib/services/)
        ↓ calls supabase.rpc/from (DB types)
        ↓ extracts data?.[0] (if RETURNS TABLE)
        ↓ uses adapters (DB → Domain)
        ↓ returns domain entities
Page/Layout Server Files
        ← receives clean domain objects
```

**Rules:**

- ✅ MUST use service functions from `src/lib/services/` for ALL database operations
- ✅ Service layer MUST handle: RPC calls, array extraction, DB→Domain adaptation, error handling
- ✅ Page/layout files MUST only work with domain types (camelCase)
- ✅ Services MUST use adapters to transform DB types → domain types
- ❌ NEVER call `supabase.rpc()` directly in page.server.ts or layout.server.ts
- ❌ NEVER call `supabase.from()` directly in page.server.ts or layout.server.ts
- ❌ NEVER use snake_case DB types in route files

**Examples:**

```typescript
// ❌ WRONG - Direct RPC call in page.server.ts
export const actions: Actions = {
  default: async ({ locals }) => {
    const { data, error } = await locals.supabase.rpc('update_organization', {...});
    const result = data?.[0]; // Manual array extraction
    // Uses snake_case DB types...
  }
};

// ✅ CORRECT - Use service function
export const actions: Actions = {
  default: async ({ locals }) => {
    const organization = await updateOrganization(locals.supabase, orgId, updates);
    // Returns single camelCase domain object, no array handling needed
  }
};
```

```typescript
// ❌ WRONG - Direct database query in page.server.ts
export const load: PageServerLoad = async ({ locals, params }) => {
	const { data } = await locals.supabase
		.from('organizations')
		.select('name')
		.eq('id', params.id)
		.single();
	return { name: data.name };
};

// ✅ CORRECT - Use service function
export const load: PageServerLoad = async ({ locals, params }) => {
	const organization = await getOrganizationById(locals.supabase, { id: params.id });
	return { organization };
};
```

**Benefits:**

- ✅ Type-safe domain objects throughout pages
- ✅ Consistent error handling
- ✅ Reusable business logic
- ✅ Testable services
- ✅ No array extraction or type casting in pages
- ✅ Clear separation of concerns

**Rationale:** Service layer centralizes database logic, ensures consistent error handling, enables testing, and maintains clean separation between routes and data access. Routes should focus on HTTP concerns, not database mechanics.

### IX. CRUD Patterns Standardization

All CRUD operations follow consistent patterns based on Organizations feature implementation.

**Rules:**

- ✅ MUST use MenuToolbar with breadcrumbs and actions (see Principle XII)
- ✅ MUST use progressive enhancement: forms work without JavaScript
- ✅ MUST use GlobalAlert with auto-close (5 seconds) for user feedback
- ✅ MUST use ConfirmModal for destructive actions
- ✅ MUST use soft delete (mark as inactive) instead of hard delete
- ✅ MUST organize routes: `/admin/{resource}/`, `/admin/{resource}/[id]/`, `/admin/{resource}/new/`, `/admin/{resource}/[id]/edit/`
- ✅ MUST use shadcn-svelte UI components when available (see Principle XI)
- ❌ NEVER create custom button implementations (use Button component)
- ❌ NEVER hard delete records (use soft delete with `is_active = false`)

**Rationale:** Consistent patterns improve developer productivity, reduce bugs, and create predictable user experience across the application.

### X. Row Level Security (RLS) Enforcement

All tables have RLS enabled with role-based policies.

**Rules:**

- ✅ MUST enable RLS on all tables
- ✅ MUST use role-based policies: `PUBLIC`, `CYCLIST`, `ORGANIZER_STAFF`, `ORGANIZER_OWNER`, `ADMIN`
- ✅ MUST use helper functions: `is_admin()`, `is_organizer()`, `is_in_event_organization()`
- ✅ MUST use ENUM casts for role comparisons: `WHERE r.name = 'CYCLIST'::role_name_enum`
- ❌ NEVER bypass RLS in application code
- ❌ NEVER use string literals for role comparisons (use `RoleTypeEnum`)

**Rationale:** RLS provides defense-in-depth security, prevents data leaks, and enforces access control at the database level.

### XI. shadcn-svelte UI Components (REQUIRED)

**ALWAYS** use shadcn-svelte UI components when available. This project uses shadcn-svelte (via bits-ui primitives) for consistent, accessible UI components.

**Available Components:**

- `Button` - Primary UI interaction component
- `AlertDialog` - Confirmation dialogs for critical actions
- `Dialog` - Modal dialogs for forms and content
- `Card` - Content containers with header/footer
- `Input` - Form input fields
- `Label` - Form labels with proper accessibility
- `Select` - Dropdown select menus
- `Checkbox` - Checkbox inputs
- `Switch` - Toggle switches
- `Table` - Data tables with consistent styling
- `Tabs` - Tabbed navigation
- `Badge` - Status indicators
- `Alert` - Inline notifications
- `Separator` - Visual dividers
- `Breadcrumb` - Navigation breadcrumbs
- `DropdownMenu` - Contextual menus
- `Popover` - Floating content
- `RadioGroup` - Radio button groups
- `Sheet` - Side panels/drawers
- `Tooltip` - Contextual help

**Rules:**

- ✅ MUST use shadcn-svelte components from `$lib/components/ui/` when available
- ✅ MUST prefer shadcn-svelte over custom implementations
- ✅ MUST use consistent component APIs (props, events, styling)
- ✅ MUST maintain Tailwind CSS styling approach for customization
- ❌ NEVER create custom UI primitives when shadcn-svelte component exists
- ❌ NEVER bypass shadcn-svelte component APIs with direct DOM manipulation

**Component Locations:**

All shadcn-svelte components are located in:

- `src/lib/components/ui/{component-name}/` - Component files
- `src/lib/components/ui/{component-name}/index.ts` - Exports

**Integration with Custom Components:**

Custom business components (in `src/lib/components/custom/`) MUST use shadcn-svelte primitives internally:

```svelte
<!-- ✅ CORRECT - Custom component using shadcn-svelte primitives -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
</script>

<Card>
	<CardHeader>
		<CardTitle>Organization Details</CardTitle>
	</CardHeader>
	<CardContent>
		<!-- Content here -->
	</CardContent>
</Card>

<!-- ❌ WRONG - Custom card implementation -->
<div class="rounded-lg border bg-card">
	<div class="p-6">
		<h3 class="text-lg font-semibold">Organization Details</h3>
	</div>
</div>
```

**Rationale:** shadcn-svelte provides battle-tested, accessible components built on Svelte 5 and bits-ui primitives. Using these components ensures consistency, reduces maintenance burden, and provides better accessibility out of the box.

### XII. MenuToolbar Navigation Pattern (KEY COMPONENT)

The `MenuToolbar` component is the **key navigation component** for all admin, panel, and account routes. It provides unified breadcrumb navigation, tabs, and action buttons.

**Component Location:** `src/lib/components/custom/MenuToolbar/MenuToolbar.svelte`

**Documentation:** See `src/lib/components/custom/MenuToolbar/MenuToolbar.md` for comprehensive usage patterns.

**Rules:**

- ✅ MUST use MenuToolbar for ALL `/admin/*`, `/panel/*`, and `/account/*` routes
- ✅ MUST define complete breadcrumb hierarchy from root to current page
- ✅ MUST use `mt-8` spacing below MenuToolbar for page content
- ✅ MUST use consistent breadcrumb font: `text-lg` (18px)
- ✅ MAY include tabs for related page navigation
- ✅ MAY include action buttons for page-specific operations
- ❌ NEVER create custom navigation toolbars for these routes
- ❌ NEVER skip MenuToolbar in admin/panel/account pages

**Required Props:**

```typescript
interface MenuToolbarProps {
	breadcrumbs: Breadcrumb[]; // Required - Page hierarchy
	tabs?: Tab[]; // Optional - Navigation tabs
	actions?: ActionButton[]; // Optional - Right-aligned action buttons
}

interface Breadcrumb {
	label: string; // Display text
	href?: string; // Link URL (undefined for current page)
}

interface Tab {
	path: string; // Tab route path
	label: string; // Tab display text
}

interface ActionButton {
	label: string; // Button text
	onClick: () => void; // Click handler
	variant?: 'primary' | 'secondary' | 'danger'; // Style variant
	href?: string; // Optional link (overrides onClick)
}
```

**Standard Usage Pattern:**

```svelte
<script lang="ts">
	import { MenuToolbar } from '$lib/components/custom/MenuToolbar';
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const breadcrumbs = [
		{ label: $t('admin.breadcrumbs.adminPanel'), href: '/admin' },
		{ label: $t('admin.breadcrumbs.organizations'), href: '/admin/organizations' },
		{ label: data.organization.name } // Current page - no href
	];

	const tabs = [
		{ path: `/admin/organizations/${data.organization.id}`, label: $t('admin.tabs.general') }
	];

	const handleEdit = () => {
		goto(`/admin/organizations/${data.organization.id}/edit`);
	};
</script>

<MenuToolbar
	{breadcrumbs}
	{tabs}
	actions={[{ label: $t('admin.actions.edit'), onClick: handleEdit, variant: 'primary' }]}
/>

<!-- IMPORTANT: Content spacing with mt-8 -->
<div class="mt-8">
	<!-- Page content here -->
</div>
```

**Common Patterns:**

1. **List Page with Add Action:**

   ```svelte
   <MenuToolbar
   	breadcrumbs={[{ label: 'Admin Panel', href: '/admin' }, { label: 'Organizations' }]}
   	actions={[{ label: 'Add Organization', onClick: handleAdd, variant: 'primary' }]}
   />
   ```

2. **Detail Page with Edit/Delete:**

   ```svelte
   <MenuToolbar
   	breadcrumbs={[
   		{ label: 'Admin Panel', href: '/admin' },
   		{ label: 'Organizations', href: '/admin/organizations' },
   		{ label: organization.name }
   	]}
   	tabs={[{ path: `/admin/organizations/${id}`, label: 'General' }]}
   	actions={[
   		{ label: 'Edit', onClick: handleEdit, variant: 'primary' },
   		{ label: 'Delete', onClick: handleDelete, variant: 'danger' }
   	]}
   />
   ```

3. **Form Page with Submit:**
   ```svelte
   <MenuToolbar
   	breadcrumbs={[
   		{ label: 'Admin Panel', href: '/admin' },
   		{ label: 'Organizations', href: '/admin/organizations' },
   		{ label: organization.name, href: `/admin/organizations/${id}` },
   		{ label: 'Edit' }
   	]}
   	actions={[{ label: 'Update', onClick: handleSubmit, variant: 'primary' }]}
   />
   ```

**Rationale:** MenuToolbar provides consistent navigation UX across all admin/panel routes, centralizes navigation logic per page, supports breadcrumbs + tabs + actions in one unified component, and ensures proper spacing and styling consistency.

### XIII. Atomic Database Operations

Complex multi-step operations MUST use PostgreSQL RPC functions for atomicity.

**Rules:**

- ✅ MUST use RPC functions for operations requiring multiple steps
- ✅ MUST use `SECURITY DEFINER` for functions that bypass RLS
- ✅ MUST validate inputs within RPC functions
- ✅ MUST return JSONB for flexible response structures
- ✅ MUST use adapters to transform RPC responses to domain types
- ❌ NEVER split multi-step operations across multiple API calls
- ❌ NEVER trust client-side validation alone

**Rationale:** Atomicity ensures all steps succeed or fail together, prevents partial updates, and improves performance with single database round-trips.

## Development Workflow

### Code Quality Gates

All code MUST pass these quality gates before merge:

1. **Type Safety**: Zero TypeScript errors (`npm run check`)
2. **Linting**: Zero ESLint errors (`npm run lint`)
3. **Formatting**: Prettier formatting applied (`npm run format`)
4. **Testing** (if applicable): All tests pass (`npm run test`)
5. **Build**: Production build succeeds (`npm run build`)

### Migration Strategy

**CRITICAL:** Always work with **LOCAL** database during development.

**Rules:**

- ✅ MUST edit existing migration files during active development (DEFAULT mode)
- ✅ MUST run `supabase db reset` after editing migrations
- ✅ MUST regenerate types: `supabase gen types typescript --local > src/lib/types/database.types.ts`
- ✅ MUST test locally before pushing to remote
- ❌ NEVER push to remote database without explicit user approval
- ❌ NEVER create new migrations during active development (unless explicitly requested)

**Rationale:** Editing existing migrations keeps history clean. Always working locally prevents accidental production database corruption.

### Form Action Pattern

All forms use SvelteKit form actions with progressive enhancement.

**Rules:**

- ✅ MUST use `use:enhance` directive for progressive enhancement
- ✅ MUST handle both success and error states
- ✅ MUST show success alerts before redirects
- ✅ MUST use `$effect()` for form result processing
- ✅ MUST track `hasProcessedForm` state to prevent duplicate processing
- ❌ NEVER use client-side-only form handling
- ❌ NEVER skip server-side validation

**Rationale:** Progressive enhancement ensures forms work without JavaScript, server-side validation prevents security issues, and proper state tracking prevents bugs.

### Button Usage Guidelines

**ALWAYS** use the `Button` component (shadcn-svelte) for interactive buttons and button-like links.

**Rules:**

- ✅ MUST use Button component with appropriate variant: `filled`, `outlined`, `text`
- ✅ MUST choose correct color: `primary` (blue), `secondary` (gray), `danger` (red), `success` (green)
- ✅ MUST select proper size: `sm` (navigation), `md` (forms/default), `lg` (hero sections)
- ✅ Standard inline text links (in tables) can remain as plain `<a>` tags
- ❌ NEVER create custom button implementations with inline styles
- ❌ NEVER use custom classes on Button component (props only)

**Rationale:** Consistent button styling improves UX, reduces CSS duplication, and ensures accessibility compliance.

## Technology Constraints

### Stack Requirements

**Framework:** SvelteKit 2.47.1 with Svelte 5 (runes syntax)
**Language:** TypeScript 5.9.3 (strict mode enabled)
**Backend:** Supabase (PostgreSQL + Auth + Storage + Realtime)
**Styling:** Tailwind CSS 4.1.14
**UI Components:** shadcn-svelte (via bits-ui primitives)
**State:** Svelte Stores
**Build:** Vite 7.1.10
**Testing:** Vitest (unit) + Playwright (e2e)
**Database Migrations:** Supabase CLI

### Performance Standards

- **Session Loading**: 1 database call per request (via Session Optimization Pattern)
- **Type Checking**: Zero errors, zero warnings in strict mode
- **Build Time**: Must complete successfully with zero errors
- **Page Load**: Server-side rendering (SSR) for all pages

### Security Standards

- **Authentication**: Supabase Auth with automatic cookie management via `@supabase/ssr`
- **Authorization**: Row Level Security (RLS) policies for all tables
- **Input Validation**: Server-side validation for all form submissions
- **CSRF Protection**: SvelteKit built-in CSRF protection
- **XSS Prevention**: Svelte auto-escaping + CSP headers
- **SQL Injection Prevention**: Parameterized queries via Supabase SDK

## Governance

### Amendment Procedure

1. **Proposal**: Document proposed change with rationale in GitHub issue
2. **Review**: Team review and discussion (minimum 2 approvals required)
3. **Migration Plan**: Document migration path for existing code
4. **Approval**: Lead architect final approval
5. **Implementation**: Update constitution.md with version bump
6. **Communication**: Announce changes to team with migration guide

### Versioning Policy

Constitution follows **semantic versioning**:

- **MAJOR**: Backward incompatible governance/principle removals or redefinitions
- **MINOR**: New principle/section added or materially expanded guidance
- **PATCH**: Clarifications, wording, typo fixes, non-semantic refinements

### Compliance Review

- **Pre-Merge**: All PRs must verify compliance with constitution principles
- **Weekly**: Architecture review meeting to discuss violations and justifications
- **Monthly**: Constitution review to ensure principles remain relevant
- **Quarterly**: Complexity audit to identify unjustified violations

### Complexity Justification

Any violation of constitution principles MUST be justified with:

1. **Why Needed**: Specific problem that requires violation
2. **Simpler Alternative Rejected**: Why compliant approach insufficient
3. **Mitigation Plan**: How to minimize impact of violation
4. **Review Schedule**: When to revisit and potentially refactor

**Version**: 1.2.0 | **Ratified**: 2025-11-18 | **Last Amended**: 2025-11-20

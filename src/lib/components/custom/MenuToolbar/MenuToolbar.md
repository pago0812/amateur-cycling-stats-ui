# MenuToolbar Component

A flexible navigation toolbar component that supports hierarchical breadcrumb navigation, horizontal tabs, and action buttons. Each page defines its own complete navigation context through a single unified toolbar.

## Component Location

`src/lib/components/MenuToolbar.svelte`

## Props

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

## Architecture

The MenuToolbar uses a **single-level unified architecture** where each page (`+page.svelte`) defines its complete navigation context.

### Page-Level Toolbar

- **Location**: Every page that needs navigation (`+page.svelte`)
- **Purpose**: Provide complete navigation context for the current page
- **Styling**:
  - Consistent breadcrumb font: `text-lg` (18px)
  - Full padding: `p-4`
- **Components**:
  - **Breadcrumbs**: Full hierarchical path from root to current page
  - **Tabs**: Optional navigation tabs for related pages
  - **Actions**: Optional page-specific action buttons
- **Content Spacing**: Content below toolbar should have `mt-8` margin

**Example**: Admin organizations overview page

```svelte
<MenuToolbar
	breadcrumbs={[
		{ label: 'Admin Panel', href: '/admin' },
		{ label: 'Organizations', href: '/admin/organizations' },
		{ label: organization.name }
	]}
	tabs={[{ path: `/admin/organizations/${id}`, label: 'General information' }]}
	actions={[
		{ label: 'Edit Organization', onClick: handleEdit, variant: 'primary' },
		{ label: 'Delete Organization', onClick: handleDelete, variant: 'danger' }
	]}
/>

<div class="mt-8">
	<!-- Page content here -->
</div>
```

## Usage Patterns

### Pattern 1: Simple Section Navigation

Root pages with tabs for subsections.

```svelte
<!-- In +page.svelte -->
<MenuToolbar
	breadcrumbs={[{ label: 'Admin Panel' }]}
	tabs={[
		{ path: '/admin', label: 'Summary' },
		{ path: '/admin/organizations', label: 'Organizations' }
	]}
/>

<div class="mt-8">
	<!-- Page content -->
</div>
```

### Pattern 2: List Page with Action

Listing pages with an "Add" button.

```svelte
<MenuToolbar
	breadcrumbs={[{ label: 'Admin Panel', href: '/admin' }, { label: 'Organizations' }]}
	actions={[
		{
			label: 'Add organization',
			onClick: handleAddOrganization,
			variant: 'primary'
		}
	]}
/>

<div class="mt-8">
	<OrganizationsTable organizations={data.organizations} />
</div>
```

### Pattern 3: Detail Page with Tabs and Actions

Detail pages with related tabs and multiple actions.

```svelte
<script lang="ts">
	const handleEdit = () => {
		goto(`/admin/organizations/${data.organization.id}/edit`);
	};

	const handleDelete = () => {
		isDeleteModalOpen = true;
	};
</script>

<MenuToolbar
	breadcrumbs={[
		{ label: 'Admin Panel', href: '/admin' },
		{ label: 'Organizations', href: '/admin/organizations' },
		{ label: data.organization.name }
	]}
	tabs={[{ path: `/admin/organizations/${id}`, label: 'General information' }]}
	actions={[
		{ label: 'Edit Organization', onClick: handleEdit, variant: 'primary' },
		{ label: 'Delete Organization', onClick: handleDelete, variant: 'danger' }
	]}
/>

<div class="mt-8">
	<OrganizationProfile organization={data.organization} />
</div>
```

### Pattern 4: Form Page with Submit Action

Form pages with deep breadcrumb paths and submit button.

```svelte
<script lang="ts">
	let organizationForm: HTMLFormElement;

	const handleSubmit = () => {
		organizationForm.requestSubmit();
	};
</script>

<MenuToolbar
	breadcrumbs={[
		{ label: 'Admin Panel', href: '/admin' },
		{ label: 'Organizations', href: '/admin/organizations' },
		{ label: data.organization.name, href: `/admin/organizations/${id}` },
		{ label: 'Edit' }
	]}
	actions={[
		{
			label: 'Update Organization',
			onClick: handleSubmit,
			variant: 'primary'
		}
	]}
/>

<div class="mt-8">
	<form bind:this={organizationForm} method="POST" use:enhance>
		<!-- Form fields -->
	</form>
</div>
```

## Features

### Smart Active Tab Detection

The component uses an intelligent longest-path matching algorithm to determine the active tab:

```typescript
// Finds the most specific matching tab
// Example: At /admin/organizations/123, "Organizations" tab is active (not "General Config")
const activeTabPath = $derived.by(() => {
	const matchingTabs = tabs.filter(
		(tab) => $page.url.pathname === tab.path || $page.url.pathname.startsWith(tab.path + '/')
	);
	return matchingTabs.sort((a, b) => b.path.length - a.path.length)[0]?.path;
});
```

### Action Buttons

The toolbar supports multiple action buttons displayed side-by-side with consistent spacing (`gap-2`).

**Button Variants:**

- **`primary`**: Standard actions (blue border/text - default)
- **`secondary`**: Less important actions (gray border/text)
- **`danger`**: Destructive actions (red border/text)

**Features:**

- Multiple buttons supported (e.g., Edit + Delete)
- Optional `href` prop for link-based actions (overrides onClick)
- Consistent Button component styling
- `gap-2` spacing between multiple actions

### Responsive Breadcrumbs

- Parent links are clickable with hover effects
- Current page (last item) is bold and non-clickable
- Uses `/` separator with gray-400 color

## Design System

### Color Palette

- **Primary text**: `text-gray-800` (#1f2937) - Active tabs, current breadcrumb
- **Secondary text**: `text-gray-500` (#6b7280) - Inactive tabs, breadcrumb links
- **Separator**: `text-gray-400` (#9ca3af) - Breadcrumb separators
- **Active border**: `border-gray-800` - Active tab indicator
- **Hover border**: `border-gray-300` - Inactive tab hover
- **Background**: `bg-gray-50` - Toolbar background

### Typography

- **Breadcrumbs**: `text-lg leading-none` (18px, no line-height)
- **Tabs**: `text-base leading-none` (16px, no line-height)
- **Action buttons**: `text-base leading-none` (16px, no line-height)

### Spacing

- **Toolbar padding**: `p-4` (16px all sides)
- **Content margin**: `mt-8` (32px below toolbar)
- **Tab gap**: `gap-8` (32px between tabs)
- **Breadcrumb gap**: `gap-2` (8px between items)

## Complete Implementation Example

```svelte
<script lang="ts">
	import { MenuToolbar } from '$lib/components';
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Page breadcrumbs showing full hierarchy
	const breadcrumbs = [
		{ label: $t('admin.breadcrumbs.adminPanel'), href: '/admin' },
		{ label: $t('admin.breadcrumbs.allOrganizations'), href: '/admin/organizations' },
		{ label: data.organization.name }
	];

	// Page tabs for related views
	const tabs = [
		{
			path: `/admin/organizations/${data.organization.id}`,
			label: $t('admin.organizations.tabs.generalInformation')
		}
	];

	const handleEdit = () => {
		goto(`/admin/organizations/${data.organization.id}/edit`);
	};

	const handleDelete = () => {
		// Open delete confirmation modal
		isDeleteModalOpen = true;
	};
</script>

<!-- Page Toolbar with complete navigation context -->
<MenuToolbar
	{breadcrumbs}
	{tabs}
	actions={[
		{ label: $t('admin.organizations.editButton'), onClick: handleEdit, variant: 'primary' },
		{ label: $t('admin.organizations.deleteButton'), onClick: handleDelete, variant: 'danger' }
	]}
/>

<!-- Page Content with spacing -->
<div class="mt-8">
	<OrganizationProfile organization={data.organization} />
</div>
```

## Benefits

1. **Simplified Architecture**: Single-level system eliminates layout/page coordination complexity
2. **Complete Context**: Each page declares its full navigation hierarchy
3. **Easier to Maintain**: All navigation logic lives in one place per page
4. **Flexible**: Supports breadcrumbs, tabs, and actions in any combination
5. **Smart Active State**: Longest-path matching for accurate tab highlighting
6. **Accessible**: Semantic HTML with proper nav elements
7. **Responsive**: Horizontal scrolling for tabs on small screens
8. **i18n Ready**: Works with translation keys for all text content
9. **Type-Safe**: Full TypeScript support with interface definitions

## Migration Note

The component has been simplified from a two-level system (primary/secondary) to a unified single-level architecture. The `level` prop has been removed, and all toolbars now use consistent styling. This makes the navigation hierarchy easier to understand and maintain.

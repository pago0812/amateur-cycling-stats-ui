# MenuToolbar Component

A flexible navigation toolbar component that supports hierarchical breadcrumb navigation, horizontal tabs, and action buttons. Used across all authenticated sections of the application (/admin, /panel, /account).

## Component Location
`src/lib/components/MenuToolbar.svelte`

## Props

```typescript
interface MenuToolbarProps {
  breadcrumbs: Breadcrumb[];        // Required - Page hierarchy
  tabs?: Tab[];                     // Optional - Navigation tabs
  action?: ActionButton;            // Optional - Right-aligned button
  level?: 'primary' | 'secondary';  // Optional - Toolbar hierarchy level (default: 'primary')
}

interface Breadcrumb {
  label: string;      // Display text
  href?: string;      // Link URL (undefined for current page)
}

interface Tab {
  path: string;       // Tab route path
  label: string;      // Tab display text
}

interface ActionButton {
  label: string;                              // Button text
  onClick: () => void;                        // Click handler
  variant?: 'primary' | 'secondary' | 'danger'; // Style variant
}
```

## Toolbar Hierarchy System

The application uses a **two-level toolbar hierarchy** to create clear information architecture:

### Primary Toolbar (level="primary")
- **Location**: Section-level layouts (`+layout.svelte`)
- **Purpose**: Define main section navigation
- **Styling**:
  - Larger breadcrumb font: `text-lg` (18px)
  - Full padding: `p-4`
- **Pattern**:
  - Single breadcrumb showing section name
  - Navigation tabs for main subsections
  - Logout button (in authenticated sections)

**Example**: `/admin` layout
```svelte
<MenuToolbar
  breadcrumbs={[{ label: 'Admin' }]}
  tabs={[
    { path: '/admin', label: 'General Config' },
    { path: '/admin/organizations', label: 'Organizations' }
  ]}
  action={{ label: 'Logout', onClick: handleLogout, variant: 'danger' }}
  level="primary"
/>
```

### Secondary Toolbar (level="secondary")
- **Location**: Page-level components (`+page.svelte` or nested `+layout.svelte`)
- **Purpose**: Show page-specific navigation and context
- **Styling**:
  - Standard breadcrumb font: `text-base` (16px)
  - Reduced padding: `px-4 pb-4` (no top padding for tighter spacing)
- **Pattern**:
  - Detailed breadcrumb path (parent → current)
  - Optional tabs for subsection navigation
  - Optional action buttons (Add, Edit, etc.)
- **Content Spacing**: Content below secondary toolbar should have `mt-8` margin

**Example**: `/admin/organizations/[id]` layout
```svelte
<MenuToolbar
  breadcrumbs={[
    { label: 'All Organizations', href: '/admin/organizations' },
    { label: organization.name }
  ]}
  tabs={[
    { path: `/admin/organizations/${id}`, label: 'Overview' },
    { path: `/admin/organizations/${id}/members`, label: 'Members' }
  ]}
  level="secondary"
/>

<div class="mt-8">
  <!-- Page content here -->
</div>
```

## Usage Patterns

### Pattern 1: Primary Toolbar Only
Pages that don't need detailed navigation.

```svelte
<!-- In +layout.svelte -->
<MenuToolbar
  breadcrumbs={[{ label: 'Panel' }]}
  tabs={[
    { path: '/panel', label: 'Overview' },
    { path: '/panel/members', label: 'Members' }
  ]}
  action={{ label: 'Logout', onClick: handleLogout, variant: 'danger' }}
  level="primary"
/>

<div>
  {@render children()}
</div>
```

### Pattern 2: Two Toolbars (Primary + Secondary)
Pages with complex hierarchy requiring multiple navigation levels.

```svelte
<!-- In +layout.svelte (Primary) -->
<MenuToolbar
  breadcrumbs={[{ label: 'Admin' }]}
  tabs={[
    { path: '/admin', label: 'General Config' },
    { path: '/admin/organizations', label: 'Organizations' }
  ]}
  action={{ label: 'Logout', onClick: handleLogout, variant: 'danger' }}
  level="primary"
/>

<div>
  {@render children()}
</div>

<!-- In +page.svelte (Secondary) -->
<MenuToolbar
  breadcrumbs={[{ label: 'General Config' }]}
  level="secondary"
/>

<div class="mt-8">
  <!-- Page content -->
</div>
```

### Pattern 3: Secondary with Breadcrumb Path
Shows hierarchical navigation with clickable parent links.

```svelte
<MenuToolbar
  breadcrumbs={[
    { label: 'All Organizations', href: '/admin/organizations' },
    { label: 'Pro Cycling League Spain' }
  ]}
  tabs={[
    { path: `/admin/organizations/${id}`, label: 'Overview' },
    { path: `/admin/organizations/${id}/members`, label: 'Members' }
  ]}
  level="secondary"
/>

<div class="mt-8">
  <!-- Page content -->
</div>
```

### Pattern 4: Secondary with Action Button
Includes page-specific actions like Add, Edit, etc.

```svelte
<MenuToolbar
  breadcrumbs={[{ label: 'All Organizations' }]}
  action={{
    label: 'Add Organization',
    onClick: handleAddOrganization,
    variant: 'primary'
  }}
  level="secondary"
/>

<!-- Content starts immediately (no mt-8) when using table layout -->
<div class="p-4 py-12">
  <OrganizationsTable organizations={data.organizations} />
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
    (tab) => $page.url.pathname === tab.path ||
             $page.url.pathname.startsWith(tab.path + '/')
  );
  return matchingTabs.sort((a, b) => b.path.length - a.path.length)[0]?.path;
});
```

### Action Button Variants
Three style variants for different semantic meanings:

- **`primary`**: Standard actions (gray-800, hover: gray-600)
- **`secondary`**: Less important actions (gray-500, hover: gray-800)
- **`danger`**: Destructive actions like Logout (gray-800, hover: red-600)

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
- **Primary breadcrumbs**: `text-lg leading-none` (18px, no line-height)
- **Secondary breadcrumbs**: `text-base leading-none` (16px, no line-height)
- **Tabs**: `text-base leading-none` (16px, no line-height)
- **Action buttons**: `text-base leading-none` (16px, no line-height)

### Spacing
- **Toolbar padding (primary)**: `p-4` (16px all sides)
- **Toolbar padding (secondary)**: `px-4 pb-4` (16px horizontal and bottom, no top)
- **Content margin**: `mt-8` (32px below secondary toolbar)
- **Tab gap**: `gap-8` (32px between tabs)
- **Breadcrumb gap**: `gap-2` (8px between items)

## Complete Implementation Example

```svelte
<script lang="ts">
  import MenuToolbar from '$lib/components/MenuToolbar.svelte';
  import { t } from '$lib/i18n';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  // Logout form reference
  let logoutForm: HTMLFormElement;

  // Primary toolbar tabs
  const mainTabs = [
    { path: '/admin', label: $t('admin.tabs.generalConfig') },
    { path: '/admin/organizations', label: $t('admin.tabs.organizations') }
  ];

  // Secondary toolbar breadcrumbs with hierarchy
  const breadcrumbs = [
    { label: $t('admin.breadcrumbs.allOrganizations'), href: '/admin/organizations' },
    { label: data.organization.name }
  ];

  // Secondary toolbar tabs for subsections
  const subTabs = [
    { path: `/admin/organizations/${data.organization.id}`, label: $t('admin.organizations.tabs.overview') },
    { path: `/admin/organizations/${data.organization.id}/members`, label: $t('admin.organizations.tabs.members') }
  ];

  const handleLogout = () => {
    logoutForm.requestSubmit();
  };

  const handleAddMember = () => {
    // Add member logic
  };
</script>

<!-- Hidden logout form -->
<form method="POST" action="?/logout" bind:this={logoutForm} class="hidden"></form>

<!-- Primary Toolbar (in layout) -->
<MenuToolbar
  breadcrumbs={[{ label: $t('admin.title') }]}
  tabs={mainTabs}
  action={{ label: $t('common.navigation.logout'), onClick: handleLogout, variant: 'danger' }}
  level="primary"
/>

<!-- Secondary Toolbar (in page) -->
<MenuToolbar
  {breadcrumbs}
  tabs={subTabs}
  action={{ label: $t('admin.organizations.addMember'), onClick: handleAddMember, variant: 'primary' }}
  level="secondary"
/>

<!-- Page Content with spacing -->
<div class="mt-8">
  <OrganizationProfile organization={data.organization} />
</div>
```

## Benefits

1. **Clear Hierarchy**: Two-level system creates clear information architecture
2. **Consistent Navigation**: Same component used across all authenticated sections
3. **Flexible**: Supports breadcrumbs, tabs, and actions in any combination
4. **Smart Active State**: Longest-path matching for accurate tab highlighting
5. **Accessible**: Semantic HTML with proper nav elements
6. **Responsive**: Horizontal scrolling for tabs on small screens
7. **i18n Ready**: Works with translation keys for all text content
8. **Type-Safe**: Full TypeScript support with interface definitions

## Migration Note

This component replaces the deprecated `SecondaryToolbar` and `TertiaryToolbar` components, providing a unified interface for all toolbar navigation needs.

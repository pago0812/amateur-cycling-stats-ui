# CRUD Patterns Guide

This document describes the standardized patterns for implementing Create, Read, Update, Delete (CRUD) operations in the application, based on the Organizations feature implementation.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Pattern: List Page](#pattern-list-page)
- [Pattern: Detail Page](#pattern-detail-page)
- [Pattern: Create Page](#pattern-create-page)
- [Pattern: Edit Page](#pattern-edit-page)
- [Pattern: Delete Action](#pattern-delete-action)
- [Components](#components)
- [Server Actions](#server-actions)
- [Best Practices](#best-practices)

---

## Overview

The CRUD patterns follow these principles:

1. **Consistent Navigation**: MenuToolbar with breadcrumbs and actions
2. **Progressive Enhancement**: Forms work without JavaScript
3. **User Feedback**: GlobalAlert with auto-close (5 seconds)
4. **Confirmation for Destructive Actions**: ConfirmModal for delete
5. **Type Safety**: Strict TypeScript throughout
6. **Soft Delete**: Mark as inactive instead of hard delete
7. **i18n Ready**: All text uses translation keys

---

## Architecture

### File Structure

```
src/routes/admin/{resource}/
├── +page.svelte              # List view
├── +page.server.ts           # List load + actions
├── [id]/
│   ├── +page.svelte          # Detail view
│   ├── +page.server.ts       # Detail load + delete action
│   ├── +layout.svelte        # Shared layout (if tabs needed)
│   ├── edit/
│   │   ├── +page.svelte      # Edit form
│   │   └── +page.server.ts   # Update action
│   └── members/              # Additional nested routes
│       ├── +page.svelte
│       └── +page.server.ts
└── new/
    ├── +page.svelte          # Create form
    └── +page.server.ts       # Create action
```

### Component Structure

```
src/lib/components/
├── {Resource}Table.svelte    # Table for list view
├── {Resource}Profile.svelte  # Display component for detail view
├── {Resource}Form.svelte     # Reusable form (create + edit)
└── ConfirmModal.svelte       # Reusable confirmation dialog
```

---

## Pattern: List Page

**Purpose**: Display all resources in a table with search/filter and Add action.

### Example: Organizations List

**File**: `/src/routes/admin/organizations/+page.svelte`

```svelte
<script lang="ts">
	import OrganizationsTable from '$lib/components/OrganizationsTable.svelte';
	import MenuToolbar from '$lib/components/MenuToolbar.svelte';
	import { t } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Add handler - navigate to create page
	const handleAdd = () => {
		goto('/admin/organizations/new');
	};
</script>

<svelte:head>
	<title>{$t('admin.organizations.title')} - ACS</title>
</svelte:head>

<section>
	<!-- Toolbar with Add button -->
	<MenuToolbar
		breadcrumbs={[{ label: $t('admin.breadcrumbs.allOrganizations') }]}
		actions={[
			{
				label: $t('admin.organizations.addButton'),
				onClick: handleAdd,
				variant: 'primary'
			}
		]}
		level="secondary"
	/>

	<!-- Error handling -->
	{#if data.error}
		<div class="mb-6 rounded-md border border-red-300 bg-red-50 p-4">
			<p class="text-sm text-red-800">
				{$t('admin.organizations.errors.loadFailed')}: {data.error}
			</p>
		</div>
	{/if}

	<!-- Table -->
	<div class="mt-8">
		<OrganizationsTable organizations={data.organizations} />
	</div>
</section>
```

**File**: `/src/routes/admin/organizations/+page.server.ts`

```typescript
import type { PageServerLoad } from './$types';
import { getAllOrganizations } from '$lib/services/organizations';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		const organizations = await getAllOrganizations(locals.supabase);
		return { organizations };
	} catch (error) {
		console.error('Error loading organizations:', error);
		return {
			organizations: [],
			error: 'Failed to load organizations'
		};
	}
};
```

---

## Pattern: Detail Page

**Purpose**: Display resource details with Edit and Delete actions.

### Example: Organization Detail

**File**: `/src/routes/admin/organizations/[id]/+page.svelte`

```svelte
<script lang="ts">
	import OrganizationProfile from '$lib/components/OrganizationProfile.svelte';
	import MenuToolbar from '$lib/components/MenuToolbar.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import { enhance } from '$app/forms';
	import { t } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import { alertStore } from '$lib/stores/alert-store';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Modal state
	let isDeleteModalOpen = $state(false);

	// Delete form reference
	let deleteForm: HTMLFormElement = $state()!;

	// Edit action - navigate to edit page
	const handleEdit = () => {
		goto(`/admin/organizations/${data.organization.id}/edit`);
	};

	// Delete action - show confirmation modal
	const handleDelete = () => {
		isDeleteModalOpen = true;
	};

	// Confirm deletion - submit form
	const handleConfirmDelete = () => {
		deleteForm.requestSubmit();
		isDeleteModalOpen = false;
	};

	// Cancel deletion
	const handleCancelDelete = () => {
		isDeleteModalOpen = false;
	};
</script>

<svelte:head>
	<title>{data.organization.name} - {$t('admin.organizations.title')} - ACS</title>
</svelte:head>

<!-- Hidden delete form -->
<form
	method="POST"
	action="?/delete"
	bind:this={deleteForm}
	class="hidden"
	use:enhance={() => {
		return async ({ result, update }) => {
			// Only show success alert if redirect happened (successful deletion)
			if (result.type === 'redirect') {
				alertStore.openAlert($t('admin.organizations.success.deleted'), 'success');
			}
			await update();
		};
	}}
></form>

<section>
	<!-- Toolbar with Edit + Delete actions -->
	<MenuToolbar
		breadcrumbs={[
			{ label: $t('admin.breadcrumbs.allOrganizations'), href: '/admin/organizations' },
			{ label: data.organization.name }
		]}
		tabs={[
			{
				path: `/admin/organizations/${data.organization.id}`,
				label: $t('admin.organizations.tabs.overview')
			},
			{
				path: `/admin/organizations/${data.organization.id}/members`,
				label: $t('admin.organizations.tabs.members')
			}
		]}
		actions={[
			{
				label: $t('admin.organizations.editButton'),
				onClick: handleEdit,
				variant: 'primary'
			},
			{
				label: $t('admin.organizations.table.delete'),
				onClick: handleDelete,
				variant: 'danger'
			}
		]}
		level="secondary"
	/>

	<!-- Resource details -->
	<div class="mt-8">
		<OrganizationProfile organization={data.organization} />
	</div>
</section>

<!-- Delete Confirmation Modal -->
<ConfirmModal
	open={isDeleteModalOpen}
	title={$t('admin.organizations.deleteConfirm.title')}
	message={`${$t('admin.organizations.deleteConfirm.message').replace('{name}', data.organization.name)}`}
	confirmText={$t('admin.organizations.deleteConfirm.confirm')}
	cancelText={$t('admin.organizations.deleteConfirm.cancel')}
	variant="danger"
	onConfirm={handleConfirmDelete}
	onCancel={handleCancelDelete}
/>
```

**File**: `/src/routes/admin/organizations/[id]/+page.server.ts`

```typescript
import { error, redirect } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getOrganizationById, deleteOrganization } from '$lib/services/organizations';
import { t } from '$lib/i18n/server';

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		const organization = await getOrganizationById(locals.supabase, { id: params.id });

		if (!organization) {
			throw error(404, t(locals.locale, 'admin.organizations.errors.notFound'));
		}

		return { organization };
	} catch (err) {
		if (err instanceof Response) throw err;
		console.error('Error loading organization:', err);
		throw error(500, t(locals.locale, 'admin.organizations.errors.loadFailed'));
	}
};

export const actions: Actions = {
	delete: async ({ params, locals }) => {
		// Layout already ensures user is authenticated and has ADMIN role
		try {
			// Soft delete organization (sets is_active = false)
			await deleteOrganization(locals.supabase, { id: params.id });
		} catch (err) {
			// Log error and return user-friendly message
			console.error('Error deleting organization:', err);
			return fail(500, {
				error: t(locals.locale, 'admin.organizations.errors.deleteFailed')
			});
		}

		// Redirect to list page (outside try-catch so it's not caught as error)
		throw redirect(303, '/admin/organizations');
	}
};
```

---

## Pattern: Create Page

**Purpose**: Form to create new resource with submit action in MenuToolbar.

### Example: Create Organization

**File**: `/src/routes/admin/organizations/new/+page.svelte`

```svelte
<script lang="ts">
	import MenuToolbar from '$lib/components/MenuToolbar.svelte';
	import OrganizationForm from '$lib/components/OrganizationForm.svelte';
	import { t } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import { alertStore } from '$lib/stores/alert-store';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Form reference for toolbar submit action
	let formElement: HTMLFormElement = $state()!;

	// Track if we've already processed this form submission
	let hasProcessedForm = $state(false);

	// Handle form submission from toolbar
	function handleSubmit() {
		formElement.requestSubmit();
	}

	// Show success message and redirect after successful creation
	$effect(() => {
		if (form && !hasProcessedForm) {
			hasProcessedForm = true;

			if (form.success && form.organizationId) {
				alertStore.openAlert($t('admin.organizations.success.created'), 'success');
				goto(`/admin/organizations/${form.organizationId as string}`);
			} else if (form.error) {
				alertStore.openAlert(form.error as string, 'error');
			}
		}
	});

	// Reset flag when form becomes null (after navigation)
	$effect(() => {
		if (!form) {
			hasProcessedForm = false;
		}
	});
</script>

<svelte:head>
	<title>{$t('admin.organizations.form.createTitle')} - ACS</title>
</svelte:head>

<section>
	<!-- Toolbar with submit action -->
	<MenuToolbar
		breadcrumbs={[
			{ label: $t('admin.breadcrumbs.allOrganizations'), href: '/admin/organizations' },
			{ label: $t('admin.organizations.form.createTitle') }
		]}
		actions={[
			{
				label: $t('admin.organizations.form.submitCreate'),
				onClick: handleSubmit,
				variant: 'primary'
			}
		]}
		level="secondary"
	/>

	<!-- Form -->
	<div class="mt-8">
		<OrganizationForm bind:formElement mode="create" {form} />
	</div>
</section>
```

**File**: `/src/routes/admin/organizations/new/+page.server.ts`

```typescript
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { createOrganization } from '$lib/services/organizations';
import { t } from '$lib/i18n/server';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const description = formData.get('description')?.toString();

		// Validation
		if (!name || name.trim().length === 0) {
			return fail(400, {
				error: t(locals.locale, 'admin.organizations.errors.nameRequired'),
				name,
				description
			});
		}

		if (name.trim().length < 3) {
			return fail(400, {
				error: t(locals.locale, 'admin.organizations.errors.nameMinLength'),
				name,
				description
			});
		}

		// Create resource
		try {
			const organization = await createOrganization(locals.supabase, {
				name: name.trim(),
				description: description?.trim() || null
			});

			return {
				success: true,
				organizationId: organization.id
			};
		} catch (error) {
			console.error('Error creating organization:', error);
			return fail(500, {
				error: t(locals.locale, 'admin.organizations.errors.createFailed'),
				name,
				description
			});
		}
	}
};
```

---

## Pattern: Edit Page

**Purpose**: Form to update existing resource with submit action in MenuToolbar.

### Example: Edit Organization

**File**: `/src/routes/admin/organizations/[id]/edit/+page.svelte`

```svelte
<script lang="ts">
	import MenuToolbar from '$lib/components/MenuToolbar.svelte';
	import OrganizationForm from '$lib/components/OrganizationForm.svelte';
	import { t } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import { alertStore } from '$lib/stores/alert-store';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Form reference for toolbar submit action
	let formElement: HTMLFormElement = $state()!;

	// Track if we've already processed this form submission
	let hasProcessedForm = $state(false);

	// Handle form submission from toolbar
	function handleSubmit() {
		formElement.requestSubmit();
	}

	// Show success message and redirect after successful update
	$effect(() => {
		if (form && !hasProcessedForm) {
			hasProcessedForm = true;

			if (form.success) {
				alertStore.openAlert($t('admin.organizations.success.updated'), 'success');
				goto(`/admin/organizations/${data.organization.id}`);
			} else if (form.error) {
				alertStore.openAlert(form.error as string, 'error');
			}
		}
	});

	// Reset flag when form becomes null (after navigation)
	$effect(() => {
		if (!form) {
			hasProcessedForm = false;
		}
	});
</script>

<svelte:head>
	<title>{$t('admin.organizations.form.editTitle')} - {data.organization.name} - ACS</title>
</svelte:head>

<section>
	<!-- Toolbar with submit action -->
	<MenuToolbar
		breadcrumbs={[
			{ label: $t('admin.breadcrumbs.allOrganizations'), href: '/admin/organizations' },
			{ label: data.organization.name, href: `/admin/organizations/${data.organization.id}` },
			{ label: $t('admin.organizations.form.editTitle') }
		]}
		actions={[
			{
				label: $t('admin.organizations.form.submitUpdate'),
				onClick: handleSubmit,
				variant: 'primary'
			}
		]}
		level="secondary"
	/>

	<!-- Form with pre-filled data -->
	<div class="mt-8">
		<OrganizationForm
			bind:formElement
			mode="edit"
			initialData={{
				name: data.organization.name,
				description: data.organization.description
			}}
			{form}
		/>
	</div>
</section>
```

**File**: `/src/routes/admin/organizations/[id]/edit/+page.server.ts`

```typescript
import type { Actions, PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import { getOrganizationById, updateOrganization } from '$lib/services/organizations';
import { t } from '$lib/i18n/server';

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		const organization = await getOrganizationById(locals.supabase, { id: params.id });

		if (!organization) {
			throw error(404, t(locals.locale, 'admin.organizations.errors.notFound'));
		}

		return { organization };
	} catch (err) {
		if (err instanceof Response) throw err;
		console.error('Error loading organization:', err);
		throw error(500, t(locals.locale, 'admin.organizations.errors.loadFailed'));
	}
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const description = formData.get('description')?.toString();

		// Validation
		if (!name || name.trim().length === 0) {
			return fail(400, {
				error: t(locals.locale, 'admin.organizations.errors.nameRequired'),
				name,
				description
			});
		}

		if (name.trim().length < 3) {
			return fail(400, {
				error: t(locals.locale, 'admin.organizations.errors.nameMinLength'),
				name,
				description
			});
		}

		// Update resource
		try {
			await updateOrganization(locals.supabase, {
				id: params.id,
				name: name.trim(),
				description: description?.trim() || null
			});

			return {
				success: true
			};
		} catch (error) {
			console.error('Error updating organization:', error);
			return fail(500, {
				error: t(locals.locale, 'admin.organizations.errors.updateFailed'),
				name,
				description
			});
		}
	}
};
```

---

## Pattern: Delete Action

**Purpose**: Soft delete with confirmation modal.

### Key Components

#### 1. Delete Form (Hidden)

```svelte
<form
	method="POST"
	action="?/delete"
	bind:this={deleteForm}
	class="hidden"
	use:enhance={() => {
		return async ({ result, update }) => {
			// Only show success alert if redirect happened
			if (result.type === 'redirect') {
				alertStore.openAlert($t('resource.success.deleted'), 'success');
			}
			await update();
		};
	}}
></form>
```

#### 2. Delete Button in MenuToolbar

```svelte
<MenuToolbar
	actions={[
		{
			label: $t('resource.table.delete'),
			onClick: handleDelete,
			variant: 'danger'
		}
	]}
/>
```

#### 3. Delete Handler

```svelte
<script lang="ts">
	let isDeleteModalOpen = $state(false);
	let deleteForm: HTMLFormElement = $state()!;

	const handleDelete = () => {
		isDeleteModalOpen = true;
	};

	const handleConfirmDelete = () => {
		deleteForm.requestSubmit();
		isDeleteModalOpen = false;
	};

	const handleCancelDelete = () => {
		isDeleteModalOpen = false;
	};
</script>
```

#### 4. Confirmation Modal

```svelte
<ConfirmModal
	open={isDeleteModalOpen}
	title={$t('resource.deleteConfirm.title')}
	message={`${$t('resource.deleteConfirm.message').replace('{name}', data.resource.name)}`}
	confirmText={$t('resource.deleteConfirm.confirm')}
	cancelText={$t('resource.deleteConfirm.cancel')}
	variant="danger"
	onConfirm={handleConfirmDelete}
	onCancel={handleCancelDelete}
/>
```

#### 5. Server Action

```typescript
export const actions: Actions = {
	delete: async ({ params, locals }) => {
		try {
			// Soft delete (sets is_active = false)
			await deleteResource(locals.supabase, { id: params.id });
		} catch (err) {
			console.error('Error deleting resource:', err);
			return fail(500, {
				error: t(locals.locale, 'resource.errors.deleteFailed')
			});
		}

		// Redirect to list page (outside try-catch)
		throw redirect(303, '/admin/resources');
	}
};
```

---

## Components

### ConfirmModal

**Location**: `/src/lib/components/ConfirmModal.svelte`

**Props**:

- `open: boolean` - Control visibility
- `title: string` - Modal heading
- `message: string` - Description text
- `confirmText: string` - Confirm button label
- `cancelText: string` - Cancel button label
- `variant: 'danger' | 'warning' | 'primary'` - Visual style
- `onConfirm: () => void` - Confirm callback
- `onCancel: () => void` - Cancel callback

**Features**:

- Backdrop click to cancel
- Escape key to cancel
- ARIA attributes for accessibility
- Uses existing Button component

**Usage**:

```svelte
<ConfirmModal
	open={isOpen}
	title="Delete Item"
	message="Are you sure you want to delete this item?"
	confirmText="Delete"
	cancelText="Cancel"
	variant="danger"
	onConfirm={handleConfirm}
	onCancel={handleCancel}
/>
```

### GlobalAlert

**Location**: `/src/lib/components/GlobalAlert.svelte`

**Features**:

- Auto-closes after 5 seconds
- Manual close button
- 4 variants: `success`, `error`, `info`, `warning`
- Fixed positioning at top center
- Accessible with ARIA attributes

**Usage**:

```typescript
import { alertStore } from '$lib/stores/alert-store';

// Show success alert
alertStore.openAlert('Operation successful!', 'success');

// Show error alert
alertStore.openAlert('Operation failed', 'error');

// Close manually
alertStore.closeAlert();
```

### MenuToolbar

**Location**: `/src/lib/components/MenuToolbar.svelte`

**Props**:

- `breadcrumbs: Breadcrumb[]` - Navigation hierarchy
- `tabs?: Tab[]` - Horizontal tabs
- `actions?: ActionButton[]` - Right-aligned action buttons
- `level: 'primary' | 'secondary'` - Hierarchy level

**Multiple Actions**:

```svelte
<MenuToolbar
	breadcrumbs={[...]}
	actions={[
		{
			label: 'Edit',
			onClick: handleEdit,
			variant: 'primary'
		},
		{
			label: 'Delete',
			onClick: handleDelete,
			variant: 'danger'
		}
	]}
/>
```

---

## Server Actions

### Form Action Structure

```typescript
export const actions: Actions = {
	// Named action (use action="?/actionName")
	actionName: async ({ request, params, locals }) => {
		const formData = await request.formData();

		// Validation
		if (invalid) {
			return fail(400, { error: 'Validation error', ...formData });
		}

		// Operation
		try {
			await performOperation();
		} catch (err) {
			return fail(500, { error: 'Operation failed' });
		}

		// Success - redirect or return data
		throw redirect(303, '/success-path');
		// OR
		return { success: true, data: result };
	},

	// Default action (use action="" or method="POST")
	default: async ({ request, locals }) => {
		// Same structure as named action
	}
};
```

### Soft Delete Pattern

```typescript
// Service function
export async function deleteResource(
	supabase: TypedSupabaseClient,
	params: DeleteResourceParams
): Promise<void> {
	const { error } = await supabase
		.from('resources')
		.update({ is_active: false })
		.eq('id', params.id);

	if (error) {
		throw new Error(`Error deleting resource: ${error.message}`);
	}
}

// Server action
export const actions: Actions = {
	delete: async ({ params, locals }) => {
		try {
			await deleteResource(locals.supabase, { id: params.id });
		} catch (err) {
			console.error('Error deleting resource:', err);
			return fail(500, { error: 'Delete failed' });
		}

		throw redirect(303, '/resources');
	}
};
```

---

## Best Practices

### 1. Form State Management

**Use Svelte 5 runes for reactive state**:

```typescript
let hasProcessedForm = $state(false);
let formElement: HTMLFormElement = $state()!;
```

**Track form submission to prevent duplicate processing**:

```typescript
$effect(() => {
	if (form && !hasProcessedForm) {
		hasProcessedForm = true;
		// Process form result
	}
});

$effect(() => {
	if (!form) {
		hasProcessedForm = false;
	}
});
```

### 2. Error Handling

**Always use i18n for error messages**:

```typescript
// ❌ Bad
throw error(404, 'Not found');

// ✅ Good
throw error(404, t(locals.locale, 'resource.errors.notFound'));
```

**Handle expected errors gracefully**:

```typescript
try {
	const resource = await getResource(supabase, { id });
	if (!resource) {
		throw error(404, t(locale, 'resource.errors.notFound'));
	}
	return { resource };
} catch (err) {
	if (err instanceof Response) throw err; // Re-throw HTTP errors
	console.error('Unexpected error:', err);
	throw error(500, t(locale, 'resource.errors.loadFailed'));
}
```

### 3. Navigation Consistency

**Always use MenuToolbar actions for primary operations**:

```svelte
<!-- ✅ Good: Submit in toolbar -->
<MenuToolbar
	actions={[
		{
			label: $t('form.submit'),
			onClick: handleSubmit,
			variant: 'primary'
		}
	]}
/>

<!-- ❌ Bad: Submit button at bottom of form -->
<Button type="submit">Submit</Button>
```

### 4. Redirect Pattern

**Place redirect outside try-catch to avoid catching it as error**:

```typescript
// ✅ Good
try {
	await deleteResource();
} catch (err) {
	return fail(500, { error: 'Failed' });
}
throw redirect(303, '/list');

// ❌ Bad
try {
	await deleteResource();
	throw redirect(303, '/list'); // Gets caught!
} catch (err) {
	return fail(500, { error: 'Failed' });
}
```

### 5. Alert Timing

**Show success alert before redirect**:

```svelte
use:enhance={() => {
	return async ({ result, update }) => {
		if (result.type === 'redirect') {
			alertStore.openAlert($t('success.message'), 'success');
		}
		await update(); // This triggers the redirect
	};
}}
```

### 6. Translation Keys Organization

**Organize by feature and action**:

```json
{
	"resource": {
		"title": "Resources",
		"addButton": "Add Resource",
		"editButton": "Edit Resource",
		"table": {
			"delete": "Delete"
		},
		"form": {
			"createTitle": "Create Resource",
			"editTitle": "Edit Resource",
			"submitCreate": "Create Resource",
			"submitUpdate": "Update Resource"
		},
		"deleteConfirm": {
			"title": "Delete Resource",
			"message": "Are you sure you want to delete {name}?",
			"confirm": "Delete",
			"cancel": "Cancel"
		},
		"success": {
			"created": "Resource created successfully",
			"updated": "Resource updated successfully",
			"deleted": "Resource deleted successfully"
		},
		"errors": {
			"loadFailed": "Failed to load resources",
			"createFailed": "Failed to create resource",
			"updateFailed": "Failed to update resource",
			"deleteFailed": "Failed to delete resource",
			"notFound": "Resource not found"
		}
	}
}
```

### 7. Type Safety

**Use explicit types for all parameters**:

```typescript
// ✅ Good
export interface DeleteResourceParams {
	id: string;
}

export async function deleteResource(
	supabase: TypedSupabaseClient,
	params: DeleteResourceParams
): Promise<void> {
	// Implementation
}

// ❌ Bad
export async function deleteResource(supabase: any, id: string) {
	// Implementation
}
```

---

## Checklist for New CRUD Feature

- [ ] Create service functions in `/src/lib/services/{resource}.ts`
- [ ] Create type definitions in `/src/lib/types/services/{resource}.ts`
- [ ] Create adapter functions in `/src/lib/adapters/{resource}.adapter.ts`
- [ ] Create domain types in `/src/lib/types/domain/{resource}.domain.ts`
- [ ] Create table component: `{Resource}Table.svelte`
- [ ] Create profile component: `{Resource}Profile.svelte`
- [ ] Create form component: `{Resource}Form.svelte`
- [ ] Create list page: `/admin/{resource}/+page.svelte` + server
- [ ] Create detail page: `/admin/{resource}/[id]/+page.svelte` + server
- [ ] Create create page: `/admin/{resource}/new/+page.svelte` + server
- [ ] Create edit page: `/admin/{resource}/[id]/edit/+page.svelte` + server
- [ ] Add delete action to detail page server
- [ ] Add translation keys (en + es)
- [ ] Add breadcrumb navigation
- [ ] Test all CRUD operations
- [ ] Test error handling
- [ ] Test i18n (both languages)
- [ ] Verify type safety (0 errors, 0 warnings)

---

## Examples in Codebase

The Organizations feature is the reference implementation:

- **List**: `/src/routes/admin/organizations/+page.svelte`
- **Detail**: `/src/routes/admin/organizations/[id]/+page.svelte`
- **Create**: `/src/routes/admin/organizations/new/+page.svelte`
- **Edit**: `/src/routes/admin/organizations/[id]/edit/+page.svelte`
- **Table**: `/src/lib/components/OrganizationsTable.svelte`
- **Profile**: `/src/lib/components/OrganizationProfile.svelte`
- **Form**: `/src/lib/components/OrganizationForm.svelte`
- **Service**: `/src/lib/services/organizations.ts`
- **Types**: `/src/lib/types/services/organizations.ts`

Follow these patterns for consistent, maintainable CRUD implementations across the application.

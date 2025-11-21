<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MenuToolbar from '$lib/components/custom/MenuToolbar/MenuToolbar.svelte';

	const { Story } = defineMeta({
		title: 'Custom/Navigation/MenuToolbar',
		component: MenuToolbar,
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	import { writable } from 'svelte/store';

	// Mock $page store for Storybook
	const mockPage = writable({
		url: new URL('http://localhost:6006/panel/organization'),
		params: {},
		route: { id: '/panel/organization' },
		status: 200,
		error: null,
		data: {},
		state: {},
		form: null
	});

	const simpleBreadcrumbs = [
		{ label: 'Panel', href: '/panel' },
		{ label: 'Organizations' } // Current page (no href)
	];

	const nestedBreadcrumbs = [
		{ label: 'Admin', href: '/admin' },
		{ label: 'Organizations', href: '/admin/organizations' },
		{ label: 'Catalonia Cycling Federation' } // Current page
	];

	const tabs = [
		{ path: '/panel/organization', label: 'Overview' },
		{ path: '/panel/organization/members', label: 'Members' }
	];

	const actions = [
		{
			label: 'Create Organization',
			onClick: () => console.log('Create clicked'),
			variant: 'default' as const
		}
	];

	const multipleActions = [
		{
			label: 'Resend Invitation',
			onClick: () => console.log('Resend clicked'),
			variant: 'secondary' as const
		},
		{
			label: 'Delete',
			onClick: () => console.log('Delete clicked'),
			variant: 'destructive' as const
		}
	];
</script>

<Story name="Overview">
<div class="mx-auto max-w-6xl p-8">
	<div class="mb-12">
		<h1 class="mb-2 text-4xl font-bold text-foreground">Menu Toolbar</h1>
		<p class="text-lg text-muted-foreground">
			Unified navigation toolbar with hierarchical breadcrumbs, tabs for section navigation, and
			optional action buttons. Provides consistent page-level navigation across the application.
		</p>
		<div class="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
			<strong>Note:</strong> This component uses <code class="rounded bg-amber-100 px-1.5 py-0.5 dark:bg-amber-900/40">$page</code> store for active tab detection,
			which cannot be fully mocked in Storybook. Tab highlighting may not work as expected.
		</div>
	</div>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Simple Breadcrumbs Only</h2>
		<MenuToolbar breadcrumbs={simpleBreadcrumbs} />
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Breadcrumbs with Tabs</h2>
		<MenuToolbar breadcrumbs={nestedBreadcrumbs} {tabs} />
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Breadcrumbs with Action Button</h2>
		<MenuToolbar breadcrumbs={simpleBreadcrumbs} {actions} />
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">
			Full Example (Breadcrumbs + Tabs + Actions)
		</h2>
		<MenuToolbar breadcrumbs={nestedBreadcrumbs} {tabs} actions={multipleActions} />
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Breadcrumb Patterns</h2>
		<div class="space-y-6">
			<div>
				<h3 class="mb-3 text-sm font-medium text-muted-foreground">Two-level Breadcrumb</h3>
				<MenuToolbar
					breadcrumbs={[{ label: 'Panel', href: '/panel' }, { label: 'Dashboard' }]}
				/>
			</div>

			<div>
				<h3 class="mb-3 text-sm font-medium text-muted-foreground">Three-level Breadcrumb</h3>
				<MenuToolbar
					breadcrumbs={[
						{ label: 'Admin', href: '/admin' },
						{ label: 'Organizations', href: '/admin/organizations' },
						{ label: 'Organization Details' }
					]}
				/>
			</div>

			<div>
				<h3 class="mb-3 text-sm font-medium text-muted-foreground">Four-level Breadcrumb</h3>
				<MenuToolbar
					breadcrumbs={[
						{ label: 'Admin', href: '/admin' },
						{ label: 'Organizations', href: '/admin/organizations' },
						{ label: 'Catalonia Cycling', href: '/admin/organizations/123' },
						{ label: 'Edit' }
					]}
				/>
			</div>
		</div>
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Features</h2>
		<ul class="list-disc space-y-2 pl-6 text-muted-foreground">
			<li>Hierarchical breadcrumb navigation using shadcn-svelte Breadcrumb component</li>
			<li>Optional tabs for section navigation</li>
			<li>Active tab highlighting based on current URL</li>
			<li>Optional action buttons (right-aligned)</li>
			<li>Responsive design with horizontal scrolling for tabs</li>
			<li>Proper semantic HTML (nav, ul, li)</li>
			<li>Accessibility: ARIA attributes, keyboard navigation</li>
		</ul>
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Component Structure</h2>
		<div class="rounded-lg border border-border bg-muted/50 p-6">
			<pre class="overflow-x-auto rounded bg-card p-4 text-sm text-card-foreground"><code>┌─────────────────────────────────────────────────────────┐
│ MenuToolbar                                             │
├─────────────────────────────────────────────────────────┤
│ Row 1: Breadcrumb Navigation                            │
│   Home / Organizations / Catalonia Cycling Federation   │
├─────────────────────────────────────────────────────────┤
│ Row 2: Tabs + Actions                                   │
│   Overview | Members                    [Create] [Edit] │
└─────────────────────────────────────────────────────────┘</code></pre>
		</div>
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Tab Active State Logic</h2>
		<p class="mb-4 text-muted-foreground">
			The active tab is determined by finding the longest matching tab path. This ensures that
			nested routes correctly highlight their parent tab.
		</p>
		<div class="overflow-x-auto rounded-lg border border-border">
			<table class="min-w-full divide-y divide-border">
				<thead class="bg-muted/50">
					<tr>
						<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground"
							>Current URL</th
						>
						<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground"
							>Active Tab</th
						>
						<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Reason</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border bg-card">
					<tr>
						<td class="px-4 py-3 text-sm font-mono">/panel/organization</td>
						<td class="px-4 py-3 text-sm">Overview</td>
						<td class="px-4 py-3 text-sm text-muted-foreground">Exact match</td>
					</tr>
					<tr>
						<td class="px-4 py-3 text-sm font-mono">/panel/organization/members</td>
						<td class="px-4 py-3 text-sm">Members</td>
						<td class="px-4 py-3 text-sm text-muted-foreground">Exact match</td>
					</tr>
					<tr>
						<td class="px-4 py-3 text-sm font-mono">/panel/organization/members/123</td>
						<td class="px-4 py-3 text-sm">Members</td>
						<td class="px-4 py-3 text-sm text-muted-foreground">Longest prefix match</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Usage</h2>
		<div class="rounded-lg border border-border bg-muted/50 p-6">
			<pre class="overflow-x-auto rounded bg-card p-4 text-sm text-card-foreground"><code>&lt;script lang="ts"&gt;
  import MenuToolbar from '$lib/components/custom/MenuToolbar/MenuToolbar.svelte';

  // Define breadcrumbs (last item has no href = current page)
  const breadcrumbs = [
    &#123; label: 'Panel', href: '/panel' &#125;,
    &#123; label: 'Organizations' &#125;
  ];

  // Optional tabs
  const tabs = [
    &#123; path: '/panel/organization', label: 'Overview' &#125;,
    &#123; path: '/panel/organization/members', label: 'Members' &#125;
  ];

  // Optional actions
  const actions = [
    &#123;
      label: 'Create',
      onClick: () =&gt; console.log('Create'),
      variant: 'default'
    &#125;
  ];
&lt;/script&gt;

&lt;!-- Breadcrumbs only --&gt;
&lt;MenuToolbar &#123;breadcrumbs&#125; /&gt;

&lt;!-- With tabs --&gt;
&lt;MenuToolbar &#123;breadcrumbs&#125; &#123;tabs&#125; /&gt;

&lt;!-- With actions --&gt;
&lt;MenuToolbar &#123;breadcrumbs&#125; &#123;actions&#125; /&gt;

&lt;!-- Full example --&gt;
&lt;MenuToolbar &#123;breadcrumbs&#125; &#123;tabs&#125; &#123;actions&#125; /&gt;</code></pre>
		</div>
	</section>
</div>

</Story>

<style>
	code {
		font-family: 'Monaco', 'Courier New', monospace;
	}
</style>

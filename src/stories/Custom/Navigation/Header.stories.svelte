<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Header from '$lib/components/custom/Header/Header.svelte';

	const { Story } = defineMeta({
		title: 'Custom/Navigation/Header',
		component: Header,
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	import { mockAdmin, mockCyclist, mockOrganizerOwner, mockOrganizerStaff } from '../../mocks';
</script>

<Story name="Overview">
<div class="mx-auto max-w-full">
	<div class="mb-12 px-8 pt-8">
		<h1 class="mb-2 text-4xl font-bold text-foreground">Header</h1>
		<p class="text-lg text-muted-foreground">
			Main navigation header with responsive design. Shows different options based on user
			authentication state and role. Includes mobile hamburger menu.
		</p>
	</div>

	<section class="mb-12">
		<h2 class="mb-6 px-8 text-2xl font-semibold text-foreground">Public User (Not Logged In)</h2>
		<Header user={null} />
		<p class="mt-4 px-8 text-sm text-muted-foreground">
			Shows: Home, Results, Login button. Portal link goes to /login.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-6 px-8 text-2xl font-semibold text-foreground">Cyclist User (Logged In)</h2>
		<Header user={mockCyclist} />
		<p class="mt-4 px-8 text-sm text-muted-foreground">
			Shows: Home, Results, Account, Logout. Portal link goes to /account.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-6 px-8 text-2xl font-semibold text-foreground">Organizer Owner</h2>
		<Header user={mockOrganizerOwner} />
		<p class="mt-4 px-8 text-sm text-muted-foreground">
			Shows: Home, Results, Account (→ /panel), Logout. Portal link goes to /panel.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-6 px-8 text-2xl font-semibold text-foreground">Organizer Staff</h2>
		<Header user={mockOrganizerStaff} />
		<p class="mt-4 px-8 text-sm text-muted-foreground">
			Shows: Home, Results, Account (→ /panel), Logout. Portal link goes to /panel.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-6 px-8 text-2xl font-semibold text-foreground">Admin User</h2>
		<Header user={mockAdmin} />
		<p class="mt-4 px-8 text-sm text-muted-foreground">
			Shows: Home, Results, Account (→ /admin), Logout. Portal link goes to /admin.
		</p>
	</section>

	<section class="mb-12 px-8">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Portal URL Logic</h2>
		<div class="overflow-x-auto rounded-lg border border-border">
			<table class="min-w-full divide-y divide-border">
				<thead class="bg-muted/50">
					<tr>
						<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground">User State</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground"
							>Portal URL</th
						>
						<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground"
							>Description</th
						>
					</tr>
				</thead>
				<tbody class="divide-y divide-border bg-card">
					<tr>
						<td class="px-4 py-3 text-sm font-medium">Not logged in</td>
						<td class="px-4 py-3 text-sm font-mono">/login</td>
						<td class="px-4 py-3 text-sm text-muted-foreground">Login page</td>
					</tr>
					<tr>
						<td class="px-4 py-3 text-sm font-medium">ADMIN</td>
						<td class="px-4 py-3 text-sm font-mono">/admin</td>
						<td class="px-4 py-3 text-sm text-muted-foreground">Admin dashboard</td>
					</tr>
					<tr>
						<td class="px-4 py-3 text-sm font-medium">ORGANIZER_OWNER</td>
						<td class="px-4 py-3 text-sm font-mono">/panel</td>
						<td class="px-4 py-3 text-sm text-muted-foreground">Organizer panel</td>
					</tr>
					<tr>
						<td class="px-4 py-3 text-sm font-medium">ORGANIZER_STAFF</td>
						<td class="px-4 py-3 text-sm font-mono">/panel</td>
						<td class="px-4 py-3 text-sm text-muted-foreground">Organizer panel</td>
					</tr>
					<tr>
						<td class="px-4 py-3 text-sm font-medium">CYCLIST</td>
						<td class="px-4 py-3 text-sm font-mono">/account</td>
						<td class="px-4 py-3 text-sm text-muted-foreground">User account settings</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<section class="mb-12 px-8">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Features</h2>
		<ul class="list-disc space-y-2 pl-6 text-muted-foreground">
			<li>Responsive design (desktop nav + mobile hamburger menu)</li>
			<li>Role-based portal URL logic</li>
			<li>Mobile drawer menu (slides in from right)</li>
			<li>Backdrop overlay for mobile menu</li>
			<li>ESC key closes mobile menu</li>
			<li>Hidden logout form (submitted programmatically)</li>
			<li>Internationalization support</li>
			<li>ARIA labels for accessibility</li>
		</ul>
	</section>

	<section class="mb-12 px-8">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Mobile Menu Behavior</h2>
		<p class="mb-4 text-muted-foreground">
			On mobile screens (sm breakpoint and below), the navigation collapses to a hamburger icon.
			Clicking it opens a drawer menu from the right side with all navigation links.
		</p>
		<div class="rounded-lg border border-border bg-muted/50 p-4">
			<p class="text-sm text-muted-foreground">
				<strong>Note:</strong> Resize your browser window to below 640px to see the mobile menu in
				action in the examples above.
			</p>
		</div>
	</section>

	<section class="px-8 pb-8">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Usage</h2>
		<div class="rounded-lg border border-border bg-muted/50 p-6">
			<pre class="overflow-x-auto rounded bg-card p-4 text-sm text-card-foreground"><code>&lt;script lang="ts"&gt;
  import Header from '$lib/components/custom/Header/Header.svelte';
  import type &#123; User &#125; from '$lib/types/domain';

  // From page load function (parent layout)
  let &#123; user &#125;: &#123; user: User | null &#125; = $props();
&lt;/script&gt;

&lt;!-- In root layout --&gt;
&lt;Header &#123;user&#125; /&gt;</code></pre>
		</div>
	</section>
</div>

</Story>

<style>
	code {
		font-family: 'Monaco', 'Courier New', monospace;
	}
</style>

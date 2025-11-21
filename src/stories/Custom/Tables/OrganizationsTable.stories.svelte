<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import OrganizationsTable from '$lib/components/custom/OrganizationsTable/OrganizationsTable.svelte';

	const { Story } = defineMeta({
		title: 'Custom/Tables/OrganizationsTable',
		component: OrganizationsTable,
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	import { mockOrganizations, generateMockOrganizations } from '../../mocks';

	const threeOrgs = mockOrganizations;
	const fifteenOrgs = generateMockOrganizations(15);
	const emptyOrgs: typeof mockOrganizations = [];
</script>

<Story name="Overview">
	<div class="mx-auto max-w-6xl p-8">
		<div class="mb-12">
			<h1 class="mb-2 text-4xl font-bold text-foreground">Organizations Table</h1>
			<p class="text-lg text-muted-foreground">
				Responsive table displaying organizations with name, state, description, event count, and
				creation date. Features clickable rows, state badges, and responsive column visibility.
			</p>
		</div>

		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Standard View (3 Organizations)</h2>
			<OrganizationsTable organizations={threeOrgs} />
		</section>

		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Large Dataset (15 Organizations)</h2>
			<OrganizationsTable organizations={fifteenOrgs} />
		</section>

		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Empty State</h2>
			<OrganizationsTable organizations={emptyOrgs} />
		</section>

		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">State Badges</h2>
			<div class="grid gap-4 md:grid-cols-3">
				<div class="rounded-lg border border-border bg-card p-6">
					<h3 class="mb-3 text-sm font-medium text-muted-foreground">Active</h3>
					<span
						class="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success"
					>
						Active
					</span>
				</div>
				<div class="rounded-lg border border-border bg-card p-6">
					<h3 class="mb-3 text-sm font-medium text-muted-foreground">Waiting Owner</h3>
					<span
						class="inline-flex items-center rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning"
					>
						Waiting Owner
					</span>
				</div>
				<div class="rounded-lg border border-border bg-card p-6">
					<h3 class="mb-3 text-sm font-medium text-muted-foreground">Disabled</h3>
					<span
						class="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
					>
						Disabled
					</span>
				</div>
			</div>
		</section>

		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Responsive Column Visibility</h2>
			<div class="overflow-x-auto rounded-lg border border-border">
				<table class="min-w-full divide-y divide-border">
					<thead class="bg-muted/50">
						<tr>
							<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Column</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Mobile</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground"
								>Tablet (sm)</th
							>
							<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground"
								>Desktop (md)</th
							>
							<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground"
								>Large (lg)</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-border bg-card">
						<tr>
							<td class="px-4 py-3 text-sm font-medium">Name</td>
							<td class="px-4 py-3 text-sm">✓</td>
							<td class="px-4 py-3 text-sm">✓</td>
							<td class="px-4 py-3 text-sm">✓</td>
							<td class="px-4 py-3 text-sm">✓</td>
						</tr>
						<tr>
							<td class="px-4 py-3 text-sm font-medium">State</td>
							<td class="px-4 py-3 text-sm">✓</td>
							<td class="px-4 py-3 text-sm">✓</td>
							<td class="px-4 py-3 text-sm">✓</td>
							<td class="px-4 py-3 text-sm">✓</td>
						</tr>
						<tr>
							<td class="px-4 py-3 text-sm font-medium">Description</td>
							<td class="px-4 py-3 text-sm text-muted-foreground">Hidden</td>
							<td class="px-4 py-3 text-sm text-muted-foreground">Hidden</td>
							<td class="px-4 py-3 text-sm">✓</td>
							<td class="px-4 py-3 text-sm">✓</td>
						</tr>
						<tr>
							<td class="px-4 py-3 text-sm font-medium">Event Count</td>
							<td class="px-4 py-3 text-sm text-muted-foreground">Hidden</td>
							<td class="px-4 py-3 text-sm">✓</td>
							<td class="px-4 py-3 text-sm">✓</td>
							<td class="px-4 py-3 text-sm">✓</td>
						</tr>
						<tr>
							<td class="px-4 py-3 text-sm font-medium">Created Date</td>
							<td class="px-4 py-3 text-sm text-muted-foreground">Hidden</td>
							<td class="px-4 py-3 text-sm text-muted-foreground">Hidden</td>
							<td class="px-4 py-3 text-sm text-muted-foreground">Hidden</td>
							<td class="px-4 py-3 text-sm">✓</td>
						</tr>
					</tbody>
				</table>
			</div>
		</section>

		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Features</h2>
			<ul class="list-disc space-y-2 pl-6 text-muted-foreground">
				<li>5 columns: Name, State, Description, Event Count, Created Date</li>
				<li>Fully clickable rows (entire row is a link)</li>
				<li>Color-coded state badges (success, warning, muted)</li>
				<li>Responsive column visibility based on screen size</li>
				<li>Text truncation for long descriptions (50 chars)</li>
				<li>Formatted dates (short format)</li>
				<li>Hover effect on rows</li>
				<li>Empty state message when no organizations</li>
				<li>Internationalization support</li>
			</ul>
		</section>

		<section>
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Usage</h2>
			<div class="rounded-lg border border-border bg-muted/50 p-6">
				<pre class="overflow-x-auto rounded bg-card p-4 text-sm text-card-foreground"><code
						>&lt;script lang="ts"&gt;
  import OrganizationsTable from '$lib/components/custom/OrganizationsTable/OrganizationsTable.svelte';
  import type &#123; Organization &#125; from '$lib/types/domain';

  let &#123; organizations &#125;: &#123; organizations: Organization[] &#125; = $props();
&lt;/script&gt;

&lt;OrganizationsTable &#123;organizations&#125; /&gt;</code
					></pre>
			</div>
		</section>
	</div>
</Story>

<style>
	code {
		font-family: 'Monaco', 'Courier New', monospace;
	}
</style>

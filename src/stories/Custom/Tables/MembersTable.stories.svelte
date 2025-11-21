<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MembersTable from '$lib/components/custom/MembersTable/MembersTable.svelte';

	const { Story } = defineMeta({
		title: 'Custom/Tables/MembersTable',
		component: MembersTable,
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	import { mockOrganizers } from '../../mocks';

	const twoMembers = mockOrganizers;
	const emptyMembers: typeof mockOrganizers = [];
</script>

<Story name="Overview">
	<div class="mx-auto max-w-6xl p-8">
		<div class="mb-12">
			<h1 class="mb-2 text-4xl font-bold text-foreground">Members Table</h1>
			<p class="text-lg text-muted-foreground">
				Displays organization members (organizers) with responsive columns for name, role, and date
				added. Shows different organizer roles with translated labels.
			</p>
		</div>

		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Organization Members (2)</h2>
			<MembersTable organizers={twoMembers} />
		</section>

		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Empty State (No Members)</h2>
			<MembersTable organizers={emptyMembers} />
		</section>

		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Organizer Role Types</h2>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="rounded-lg border border-border bg-card p-6">
					<h3 class="mb-3 text-sm font-medium text-foreground">ORGANIZER_OWNER</h3>
					<p class="text-sm text-muted-foreground">
						Full administrative access to the organization. Can manage events, races, results, and
						members.
					</p>
				</div>
				<div class="rounded-lg border border-border bg-card p-6">
					<h3 class="mb-3 text-sm font-medium text-foreground">ORGANIZER_STAFF</h3>
					<p class="text-sm text-muted-foreground">
						Limited access. Can create and edit results for the organization's events but cannot
						manage members or organization settings.
					</p>
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
						</tr>
					</thead>
					<tbody class="divide-y divide-border bg-card">
						<tr>
							<td class="px-4 py-3 text-sm font-medium">Name</td>
							<td class="px-4 py-3 text-sm">✓</td>
							<td class="px-4 py-3 text-sm">✓</td>
							<td class="px-4 py-3 text-sm">✓</td>
						</tr>
						<tr>
							<td class="px-4 py-3 text-sm font-medium">Role</td>
							<td class="px-4 py-3 text-sm text-muted-foreground">Hidden</td>
							<td class="px-4 py-3 text-sm">✓</td>
							<td class="px-4 py-3 text-sm">✓</td>
						</tr>
						<tr>
							<td class="px-4 py-3 text-sm font-medium">Date Added</td>
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
				<li>3 columns: Name, Role, Date Added</li>
				<li>Responsive column visibility based on screen size</li>
				<li>Translated role labels via i18n</li>
				<li>Formatted dates (short format)</li>
				<li>Empty state message when no members</li>
				<li>Full name display (firstName + lastName)</li>
			</ul>
		</section>

		<section>
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Usage</h2>
			<div class="rounded-lg border border-border bg-muted/50 p-6">
				<pre class="overflow-x-auto rounded bg-card p-4 text-sm text-card-foreground"><code
						>&lt;script lang="ts"&gt;
  import MembersTable from '$lib/components/custom/MembersTable/MembersTable.svelte';
  import type &#123; Organizer &#125; from '$lib/types/domain';

  let &#123; organizers &#125;: &#123; organizers: Organizer[] &#125; = $props();
&lt;/script&gt;

&lt;MembersTable &#123;organizers&#125; /&gt;</code
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

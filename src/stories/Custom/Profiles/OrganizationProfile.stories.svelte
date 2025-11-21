<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import OrganizationProfile from '$lib/components/custom/OrganizationProfile/OrganizationProfile.svelte';

	const { Story } = defineMeta({
		title: 'Custom/Profiles/OrganizationProfile',
		component: OrganizationProfile,
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	import {
		mockOrganizationActive,
		mockOrganizationWaitingOwner,
		mockOrganizationDisabled
	} from '../../mocks';
</script>

<Story name="Overview">
	<div class="mx-auto max-w-6xl p-8">
		<div class="mb-12">
			<h1 class="mb-2 text-4xl font-bold text-foreground">Organization Profile</h1>
			<p class="text-lg text-muted-foreground">
				Displays organization details in a grid layout with name, description, dates, event count,
				and status badge. Shows different states with color-coded badges.
			</p>
		</div>

		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Active Organization</h2>
			<div class="rounded-lg bg-card shadow">
				<OrganizationProfile organization={mockOrganizationActive} />
			</div>
		</section>

		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Waiting Owner Organization</h2>
			<div class="rounded-lg bg-card shadow">
				<OrganizationProfile organization={mockOrganizationWaitingOwner} />
			</div>
		</section>

		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Disabled Organization</h2>
			<div class="rounded-lg bg-card shadow">
				<OrganizationProfile organization={mockOrganizationDisabled} />
			</div>
		</section>

		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">State Badges</h2>
			<div class="grid gap-4 md:grid-cols-3">
				<div class="rounded-lg border border-border bg-card p-6">
					<h3 class="mb-3 text-sm font-medium text-muted-foreground">Active State</h3>
					<span
						class="inline-flex items-center rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success"
					>
						Active
					</span>
					<p class="mt-3 text-xs text-muted-foreground">
						Organization is operational with an owner assigned
					</p>
				</div>
				<div class="rounded-lg border border-border bg-card p-6">
					<h3 class="mb-3 text-sm font-medium text-muted-foreground">Waiting Owner State</h3>
					<span
						class="inline-flex items-center rounded-full bg-warning/10 px-3 py-1 text-sm font-medium text-warning"
					>
						Waiting Owner
					</span>
					<p class="mt-3 text-xs text-muted-foreground">Pending owner invitation acceptance</p>
				</div>
				<div class="rounded-lg border border-border bg-card p-6">
					<h3 class="mb-3 text-sm font-medium text-muted-foreground">Disabled State</h3>
					<span
						class="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground"
					>
						Disabled
					</span>
					<p class="mt-3 text-xs text-muted-foreground">Organization is inactive or soft-deleted</p>
				</div>
			</div>
		</section>

		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Features</h2>
			<ul class="list-disc space-y-2 pl-6 text-muted-foreground">
				<li>Responsive grid layout (1 column on mobile, 2 columns on larger screens)</li>
				<li>Formatted dates with full locale string</li>
				<li>Color-coded state badges (success, warning, muted)</li>
				<li>Optional event count display</li>
				<li>Handles null/undefined description gracefully</li>
				<li>Internationalization support</li>
			</ul>
		</section>

		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Data Fields</h2>
			<div class="overflow-x-auto rounded-lg border border-border">
				<table class="min-w-full divide-y divide-border">
					<thead class="bg-muted/50">
						<tr>
							<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Field</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground"
								>Description</th
							>
							<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Required</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-border bg-card">
						<tr>
							<td class="px-4 py-3 text-sm font-medium">Name</td>
							<td class="px-4 py-3 text-sm text-muted-foreground">Organization name</td>
							<td class="px-4 py-3 text-sm">Yes</td>
						</tr>
						<tr>
							<td class="px-4 py-3 text-sm font-medium">Description</td>
							<td class="px-4 py-3 text-sm text-muted-foreground"
								>Organization description (shows "-" if null)</td
							>
							<td class="px-4 py-3 text-sm">No</td>
						</tr>
						<tr>
							<td class="px-4 py-3 text-sm font-medium">Created At</td>
							<td class="px-4 py-3 text-sm text-muted-foreground">Creation timestamp (formatted)</td
							>
							<td class="px-4 py-3 text-sm">Yes</td>
						</tr>
						<tr>
							<td class="px-4 py-3 text-sm font-medium">Updated At</td>
							<td class="px-4 py-3 text-sm text-muted-foreground"
								>Last update timestamp (formatted)</td
							>
							<td class="px-4 py-3 text-sm">Yes</td>
						</tr>
						<tr>
							<td class="px-4 py-3 text-sm font-medium">Event Count</td>
							<td class="px-4 py-3 text-sm text-muted-foreground"
								>Number of events (only shown if defined)</td
							>
							<td class="px-4 py-3 text-sm">No</td>
						</tr>
						<tr>
							<td class="px-4 py-3 text-sm font-medium">State</td>
							<td class="px-4 py-3 text-sm text-muted-foreground"
								>Organization state with color badge</td
							>
							<td class="px-4 py-3 text-sm">Yes</td>
						</tr>
					</tbody>
				</table>
			</div>
		</section>

		<section>
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Usage</h2>
			<div class="rounded-lg border border-border bg-muted/50 p-6">
				<pre class="overflow-x-auto rounded bg-card p-4 text-sm text-card-foreground"><code
						>&lt;script lang="ts"&gt;
  import OrganizationProfile from '$lib/components/custom/OrganizationProfile/OrganizationProfile.svelte';
  import type &#123; Organization &#125; from '$lib/types/domain';

  let &#123; organization &#125;: &#123; organization: Organization &#125; = $props();
&lt;/script&gt;

&lt;OrganizationProfile &#123;organization&#125; /&gt;</code
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

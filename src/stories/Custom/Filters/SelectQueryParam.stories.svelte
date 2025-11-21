<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SelectQueryParam from '$lib/components/custom/SelectQueryParam/SelectQueryParam.svelte';

	const { Story } = defineMeta({
		title: 'Custom/Filters/SelectQueryParam',
		component: SelectQueryParam,
		tags: ['autodocs'],
		argTypes: {
			name: {
				control: 'text',
				description: 'The query parameter name'
			},
			title: {
				control: 'text',
				description: 'Label text for the select'
			},
			options: {
				control: 'object',
				description: 'Array of options with value and label (t)'
			}
		}
	});
</script>

<script lang="ts">
	const yearOptions = [
		{ value: '2025', t: '2025' },
		{ value: '2024', t: '2024' },
		{ value: '2023', t: '2023' },
		{ value: '2022', t: '2022' }
	];

	const categoryOptions = [
		{ value: 'all', t: 'All Categories' },
		{ value: 'elite', t: 'Elite' },
		{ value: 'amateur', t: 'Amateur' },
		{ value: 'junior', t: 'Junior' }
	];

	const genderOptions = [
		{ value: 'all', t: 'All Genders' },
		{ value: 'M', t: 'Male' },
		{ value: 'F', t: 'Female' }
	];
</script>

<Story name="Overview">
	<div class="mx-auto max-w-6xl p-8">
		<div class="mb-12">
			<h1 class="mb-2 text-4xl font-bold text-foreground">Select Query Param</h1>
			<p class="text-lg text-muted-foreground">
				A select dropdown that syncs with URL query parameters. Changes trigger SSR navigation to
				reload data based on the selected value.
			</p>
			<div
				class="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/20 dark:text-amber-200"
			>
				<strong>Note:</strong> This component uses
				<code class="rounded bg-amber-100 px-1.5 py-0.5 dark:bg-amber-900/40">$page</code>
				store from
				<code class="rounded bg-amber-100 px-1.5 py-0.5 dark:bg-amber-900/40">$app/stores</code> which
				cannot be fully mocked in Storybook. The examples below show visual appearance only.
			</div>
		</div>

		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Basic Examples</h2>
			<div class="grid gap-6 md:grid-cols-3">
				<div>
					<SelectQueryParam name="year" title="Year" options={yearOptions} />
				</div>
				<div>
					<SelectQueryParam name="category" title="Category" options={categoryOptions} />
				</div>
				<div>
					<SelectQueryParam name="gender" title="Gender" options={genderOptions} />
				</div>
			</div>
		</section>

		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Different Option Counts</h2>
			<div class="grid gap-6 md:grid-cols-2">
				<div>
					<h3 class="mb-3 text-sm font-medium text-muted-foreground">Few Options (3)</h3>
					<SelectQueryParam
						name="status"
						title="Status"
						options={[
							{ value: 'active', t: 'Active' },
							{ value: 'pending', t: 'Pending' },
							{ value: 'disabled', t: 'Disabled' }
						]}
					/>
				</div>
				<div>
					<h3 class="mb-3 text-sm font-medium text-muted-foreground">Many Options (10)</h3>
					<SelectQueryParam
						name="month"
						title="Month"
						options={[
							{ value: '1', t: 'January' },
							{ value: '2', t: 'February' },
							{ value: '3', t: 'March' },
							{ value: '4', t: 'April' },
							{ value: '5', t: 'May' },
							{ value: '6', t: 'June' },
							{ value: '7', t: 'July' },
							{ value: '8', t: 'August' },
							{ value: '9', t: 'September' },
							{ value: '10', t: 'October' }
						]}
					/>
				</div>
			</div>
		</section>

		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Common Use Cases</h2>
			<div class="grid gap-6 md:grid-cols-3">
				<div class="rounded-lg border border-border bg-card p-6">
					<h3 class="mb-4 font-semibold text-card-foreground">Results Page Filters</h3>
					<div class="space-y-4">
						<SelectQueryParam name="year" title="Year" options={yearOptions} />
						<SelectQueryParam name="category" title="Category" options={categoryOptions} />
						<SelectQueryParam name="gender" title="Gender" options={genderOptions} />
					</div>
				</div>

				<div class="rounded-lg border border-border bg-card p-6">
					<h3 class="mb-4 font-semibold text-card-foreground">Organization Filter</h3>
					<div class="space-y-4">
						<SelectQueryParam
							name="state"
							title="State"
							options={[
								{ value: 'all', t: 'All States' },
								{ value: 'ACTIVE', t: 'Active' },
								{ value: 'WAITING_OWNER', t: 'Waiting Owner' },
								{ value: 'DISABLED', t: 'Disabled' }
							]}
						/>
					</div>
				</div>

				<div class="rounded-lg border border-border bg-card p-6">
					<h3 class="mb-4 font-semibold text-card-foreground">Sort Options</h3>
					<div class="space-y-4">
						<SelectQueryParam
							name="sort"
							title="Sort By"
							options={[
								{ value: 'date-desc', t: 'Newest First' },
								{ value: 'date-asc', t: 'Oldest First' },
								{ value: 'name-asc', t: 'Name A-Z' },
								{ value: 'name-desc', t: 'Name Z-A' }
							]}
						/>
					</div>
				</div>
			</div>
		</section>

		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Features</h2>
			<ul class="list-disc space-y-2 pl-6 text-muted-foreground">
				<li>Syncs with URL query parameters</li>
				<li>Triggers SSR navigation on change (invalidates all data)</li>
				<li>Auto-selects value from URL or defaults to first option</li>
				<li>Accessible with proper label-input association</li>
				<li>Consistent styling with design system</li>
				<li>Focus ring for keyboard navigation</li>
			</ul>
		</section>

		<section>
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Usage</h2>
			<div class="rounded-lg border border-border bg-muted/50 p-6">
				<pre class="overflow-x-auto rounded bg-card p-4 text-sm text-card-foreground"><code
						>&lt;script lang="ts"&gt;
  import SelectQueryParam from '$lib/components/custom/SelectQueryParam/SelectQueryParam.svelte';

  const yearOptions = [
    &#123; value: '2025', t: '2025' &#125;,
    &#123; value: '2024', t: '2024' &#125;,
    &#123; value: '2023', t: '2023' &#125;
  ];
&lt;/script&gt;

&lt;!-- Component reads from URL ?year=2024 --&gt;
&lt;SelectQueryParam
  name="year"
  title="Year"
  options=&#123;yearOptions&#125;
/&gt;

&lt;!-- Changing value updates URL and triggers SSR reload --&gt;</code
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

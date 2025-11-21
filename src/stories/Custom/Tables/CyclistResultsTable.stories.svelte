<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CyclistResultsTable from '$lib/components/custom/CyclistResultsTable/CyclistResultsTable.svelte';

	const { Story } = defineMeta({
		title: 'Custom/Tables/CyclistResultsTable',
		component: CyclistResultsTable,
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	import { mockRaceResults, generateMockRaceResults } from '../../mocks';

	const threeResults = mockRaceResults;
	const tenResults = generateMockRaceResults(10);
	const twentyResults = generateMockRaceResults(20);
</script>

<Story name="Overview">
<div class="mx-auto max-w-6xl p-8">
	<div class="mb-12">
		<h1 class="mb-2 text-4xl font-bold text-foreground">Cyclist Results Table</h1>
		<p class="text-lg text-muted-foreground">
			Displays a cyclist's race history with columns for date, position, race, distance, ranking,
			category, and points. Includes clickable links to event details.
		</p>
	</div>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Small Dataset (3 Results)</h2>
		<CyclistResultsTable raceResults={threeResults} />
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Medium Dataset (10 Results)</h2>
		<CyclistResultsTable raceResults={tenResults} />
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Large Dataset (20 Results)</h2>
		<CyclistResultsTable raceResults={twentyResults} />
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Features</h2>
		<ul class="list-disc space-y-2 pl-6 text-muted-foreground">
			<li>7 columns: Date, Position, Race, Distance, Ranking, Category, Points</li>
			<li>Formatted dates (MM/DD)</li>
			<li>Clickable race links to event detail pages</li>
			<li>Translated category and length types</li>
			<li>Hover effect on rows</li>
			<li>Responsive with horizontal scrolling</li>
			<li>Internationalization support</li>
		</ul>
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Column Reference</h2>
		<div class="overflow-x-auto rounded-lg border border-border">
			<table class="min-w-full divide-y divide-border">
				<thead class="bg-muted/50">
					<tr>
						<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Column</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground"
							>Description</th
						>
						<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Format</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border bg-card">
					<tr>
						<td class="px-4 py-3 text-sm font-medium">Date</td>
						<td class="px-4 py-3 text-sm text-muted-foreground">Race date</td>
						<td class="px-4 py-3 text-sm font-mono">MM/DD</td>
					</tr>
					<tr>
						<td class="px-4 py-3 text-sm font-medium">Position</td>
						<td class="px-4 py-3 text-sm text-muted-foreground">Finishing place</td>
						<td class="px-4 py-3 text-sm font-mono">1, 2, 3...</td>
					</tr>
					<tr>
						<td class="px-4 py-3 text-sm font-medium">Race</td>
						<td class="px-4 py-3 text-sm text-muted-foreground">Event name (clickable link)</td>
						<td class="px-4 py-3 text-sm font-mono">Text with link</td>
					</tr>
					<tr>
						<td class="px-4 py-3 text-sm font-medium">Distance</td>
						<td class="px-4 py-3 text-sm text-muted-foreground">Race length category</td>
						<td class="px-4 py-3 text-sm font-mono">LONG, SHORT, SPRINT...</td>
					</tr>
					<tr>
						<td class="px-4 py-3 text-sm font-medium">Ranking</td>
						<td class="px-4 py-3 text-sm text-muted-foreground">Ranking system</td>
						<td class="px-4 py-3 text-sm font-mono">UCI, NATIONAL...</td>
					</tr>
					<tr>
						<td class="px-4 py-3 text-sm font-medium">Category</td>
						<td class="px-4 py-3 text-sm text-muted-foreground">Race category</td>
						<td class="px-4 py-3 text-sm font-mono">ELITE, AMATEUR...</td>
					</tr>
					<tr>
						<td class="px-4 py-3 text-sm font-medium">Points</td>
						<td class="px-4 py-3 text-sm text-muted-foreground">Ranking points earned</td>
						<td class="px-4 py-3 text-sm font-mono">100, 80, 60...</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Usage</h2>
		<div class="rounded-lg border border-border bg-muted/50 p-6">
			<pre class="overflow-x-auto rounded bg-card p-4 text-sm text-card-foreground"><code>&lt;script lang="ts"&gt;
  import CyclistResultsTable from '$lib/components/custom/CyclistResultsTable/CyclistResultsTable.svelte';
  import type &#123; RaceResult &#125; from '$lib/types/domain';

  let &#123; raceResults &#125;: &#123; raceResults: RaceResult[] &#125; = $props();
&lt;/script&gt;

&lt;CyclistResultsTable &#123;raceResults&#125; /&gt;</code></pre>
		</div>
	</section>
</div>

</Story>

<style>
	code {
		font-family: 'Monaco', 'Courier New', monospace;
	}
</style>

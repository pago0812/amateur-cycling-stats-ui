<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ResultsTable from '$lib/components/custom/ResultsTable/ResultsTable.svelte';

	const { Story } = defineMeta({
		title: 'Custom/Tables/ResultsTable',
		component: ResultsTable,
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	import { mockRaceDetailResults, generateMockRaceDetailResults } from '../../mocks';

	const threeResults = mockRaceDetailResults;
	const tenResults = generateMockRaceDetailResults(10);
	const twentyResults = generateMockRaceDetailResults(20);
</script>

<Story name="Overview">
<div class="mx-auto max-w-6xl p-8">
	<div class="mb-12">
		<h1 class="mb-2 text-4xl font-bold text-foreground">Results Table</h1>
		<p class="text-lg text-muted-foreground">
			Simple race results table showing position, cyclist name (with link), time, and points. Used
			on event detail pages to display race results.
		</p>
	</div>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Small Dataset (3 Results)</h2>
		<ResultsTable raceResults={threeResults} />
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Medium Dataset (10 Results)</h2>
		<ResultsTable raceResults={tenResults} />
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Large Dataset (20 Results)</h2>
		<ResultsTable raceResults={twentyResults} />
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Features</h2>
		<ul class="list-disc space-y-2 pl-6 text-muted-foreground">
			<li>4 columns: Position, Name, Time, Points</li>
			<li>Clickable cyclist names linking to cyclist profile pages</li>
			<li>Handles missing cyclist data gracefully (shows "-")</li>
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
						<td class="px-4 py-3 text-sm font-medium">Position</td>
						<td class="px-4 py-3 text-sm text-muted-foreground">Finishing place</td>
						<td class="px-4 py-3 text-sm font-mono">1, 2, 3...</td>
					</tr>
					<tr>
						<td class="px-4 py-3 text-sm font-medium">Name</td>
						<td class="px-4 py-3 text-sm text-muted-foreground"
							>Cyclist name (clickable link if registered)</td
						>
						<td class="px-4 py-3 text-sm font-mono">First Last (link)</td>
					</tr>
					<tr>
						<td class="px-4 py-3 text-sm font-medium">Time</td>
						<td class="px-4 py-3 text-sm text-muted-foreground"
							>Race time (shows "-" if null)</td
						>
						<td class="px-4 py-3 text-sm font-mono">HH:MM:SS</td>
					</tr>
					<tr>
						<td class="px-4 py-3 text-sm font-medium">Points</td>
						<td class="px-4 py-3 text-sm text-muted-foreground"
							>Ranking points (shows "-" if null)</td
						>
						<td class="px-4 py-3 text-sm font-mono">100, 80, 60...</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Common Use Cases</h2>
		<div class="rounded-lg border border-border bg-card p-6">
			<h3 class="mb-4 font-semibold text-card-foreground">Event Detail Page</h3>
			<p class="mb-4 text-sm text-muted-foreground">
				Display results for a specific race within an event. Used on the /results/[id] page with
				race filtering.
			</p>
			<ResultsTable raceResults={threeResults} />
		</div>
	</section>

	<section>
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Usage</h2>
		<div class="rounded-lg border border-border bg-muted/50 p-6">
			<pre class="overflow-x-auto rounded bg-card p-4 text-sm text-card-foreground"><code>&lt;script lang="ts"&gt;
  import ResultsTable from '$lib/components/custom/ResultsTable/ResultsTable.svelte';
  import type &#123; RaceDetailResult &#125; from '$lib/types/services/races';

  let &#123; raceResults &#125;: &#123; raceResults: RaceDetailResult[] &#125; = $props();
&lt;/script&gt;

&lt;ResultsTable &#123;raceResults&#125; /&gt;</code></pre>
		</div>
	</section>
</div>

</Story>

<style>
	code {
		font-family: 'Monaco', 'Courier New', monospace;
	}
</style>

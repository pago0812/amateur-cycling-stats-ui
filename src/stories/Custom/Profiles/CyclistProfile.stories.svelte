<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CyclistProfile from '$lib/components/custom/CyclistProfile/CyclistProfile.svelte';

	const { Story } = defineMeta({
		title: 'Custom/Profiles/CyclistProfile',
		component: CyclistProfile,
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	import {
		mockCyclist,
		mockCyclist2,
		mockRaceResults,
		generateMockRaceResults
	} from '../../mocks';

	// Cyclist with full data and results
	const cyclistWithResults = mockCyclist;
	const someResults = mockRaceResults;

	// Cyclist without results
	const cyclistNoResults = mockCyclist2;
	const noResults: typeof mockRaceResults = [];

	// Cyclist with many results
	const manyResults = generateMockRaceResults(15);
</script>

<Story name="Overview">
<div class="mx-auto max-w-6xl p-8">
	<div class="mb-12">
		<h1 class="mb-2 text-4xl font-bold text-foreground">Cyclist Profile</h1>
		<p class="text-lg text-muted-foreground">
			Displays cyclist information and race history. Shows personal details with profile avatar and
			a comprehensive table of race results.
		</p>
	</div>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Cyclist with Race Results</h2>
		<CyclistProfile cyclist={cyclistWithResults} raceResults={someResults} />
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Cyclist without Results</h2>
		<CyclistProfile cyclist={cyclistNoResults} raceResults={noResults} />
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Cyclist with Many Results (15)</h2>
		<CyclistProfile cyclist={cyclistWithResults} raceResults={manyResults} />
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Features</h2>
		<ul class="list-disc space-y-2 pl-6 text-muted-foreground">
			<li>Profile header with avatar placeholder (initials)</li>
			<li>Displays cyclist name, birth year, and gender</li>
			<li>Integrated CyclistResultsTable component</li>
			<li>Empty state message when no results</li>
			<li>Internationalization support</li>
			<li>Responsive layout with proper spacing</li>
		</ul>
	</section>

	<section>
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Usage</h2>
		<div class="rounded-lg border border-border bg-muted/50 p-6">
			<pre class="overflow-x-auto rounded bg-card p-4 text-sm text-card-foreground"><code>&lt;script lang="ts"&gt;
  import CyclistProfile from '$lib/components/custom/CyclistProfile/CyclistProfile.svelte';
  import type &#123; Cyclist, RaceResult &#125; from '$lib/types/domain';

  // Data from page load function
  let &#123; cyclist, raceResults &#125;: &#123;
    cyclist: Cyclist;
    raceResults: RaceResult[]
  &#125; = $props();
&lt;/script&gt;

&lt;CyclistProfile &#123;cyclist&#125; &#123;raceResults&#125; /&gt;</code></pre>
		</div>
	</section>
</div>

</Story>

<style>
	code {
		font-family: 'Monaco', 'Courier New', monospace;
	}
</style>

<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RaceFilterSelect from '$lib/components/custom/RaceFilterSelect/RaceFilterSelect.svelte';

	const { Story } = defineMeta({
		title: 'Custom/Filters/RaceFilterSelect',
		component: RaceFilterSelect,
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	import type { EventWithRaces } from '$lib/types/services/events';
	import { mockEventPast, mockRace } from '../../mocks';

	// Create a mock EventWithRaces object
	const mockEventWithRaces: EventWithRaces = {
		...mockEventPast,
		races: [
			{
				...mockRace,
				id: 'race-1',
				name: 'Elite Men Long Distance',
				raceCategoryId: 'cat-elite',
				raceCategoryGenderId: 'gender-male',
				raceCategoryLengthId: 'length-long'
			},
			{
				...mockRace,
				id: 'race-2',
				name: 'Elite Women Long Distance',
				raceCategoryId: 'cat-elite',
				raceCategoryGenderId: 'gender-female',
				raceCategoryLengthId: 'length-long'
			},
			{
				...mockRace,
				id: 'race-3',
				name: 'Amateur Men Short Distance',
				raceCategoryId: 'cat-amateur',
				raceCategoryGenderId: 'gender-male',
				raceCategoryLengthId: 'length-short'
			}
		],
		supportedRaceCategories: [
			{
				id: 'cat-elite',
				name: 'ELITE',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			},
			{
				id: 'cat-amateur',
				name: 'AMATEUR',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			}
		],
		supportedRaceCategoryGenders: [
			{
				id: 'gender-male',
				name: 'MALE',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			},
			{
				id: 'gender-female',
				name: 'FEMALE',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			}
		],
		supportedRaceCategoryLengths: [
			{
				id: 'length-long',
				name: 'LONG',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			},
			{
				id: 'length-short',
				name: 'SHORT',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			}
		]
	};
</script>

<Story name="Overview">
<div class="mx-auto max-w-6xl p-8">
	<div class="mb-12">
		<h1 class="mb-2 text-4xl font-bold text-foreground">Race Filter Select</h1>
		<p class="text-lg text-muted-foreground">
			Intelligent filter component for race results pages. Provides three dropdowns (category,
			gender, distance) that work together to find matching races or show "no results" state.
		</p>
		<div class="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
			<strong>Note:</strong> This component uses <code class="rounded bg-amber-100 px-1.5 py-0.5 dark:bg-amber-900/40">goto()</code> from
			<code class="rounded bg-amber-100 px-1.5 py-0.5 dark:bg-amber-900/40">$app/navigation</code> which cannot be mocked in Storybook. The examples below
			show visual appearance only.
		</div>
	</div>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Basic Example</h2>
		<div class="rounded-lg border border-border bg-card p-6">
			<RaceFilterSelect event={mockEventWithRaces} currentRaceId="race-1" />
		</div>
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Filter Modes</h2>
		<div class="space-y-6">
			<div class="rounded-lg border border-border bg-card p-6">
				<h3 class="mb-4 text-lg font-semibold">Mode A: Race ID Match (Exact Race Found)</h3>
				<p class="mb-4 text-sm text-muted-foreground">
					When filters match an existing race, navigates with <code class="rounded bg-muted px-1.5 py-0.5">?raceId=UUID</code>
				</p>
				<RaceFilterSelect event={mockEventWithRaces} currentRaceId="race-1" />
				<p class="mt-4 text-xs text-muted-foreground">
					Example URL: <code class="rounded bg-muted px-1.5 py-0.5">/results/202?raceId=race-1</code>
				</p>
			</div>

			<div class="rounded-lg border border-border bg-card p-6">
				<h3 class="mb-4 text-lg font-semibold">Mode B: Filter State (No Matching Race)</h3>
				<p class="mb-4 text-sm text-muted-foreground">
					When filters don't match any race, navigates with individual filter params to show "no
					results" state
				</p>
				<RaceFilterSelect
					event={mockEventWithRaces}
					filterState={{
						categoryId: 'cat-amateur',
						genderId: 'gender-female',
						lengthId: 'length-long'
					}}
				/>
				<p class="mt-4 text-xs text-muted-foreground">
					Example URL: <code class="rounded bg-muted px-1.5 py-0.5"
						>/results/202?categoryId=cat-amateur&genderId=gender-female&lengthId=length-long</code
					>
				</p>
			</div>
		</div>
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Filter Flow</h2>
		<div class="rounded-lg border border-border bg-muted/50 p-6">
			<pre class="overflow-x-auto rounded bg-card p-4 text-sm text-card-foreground"><code>User Changes Filter
       ↓
Find Matching Race
       ↓
    ┌──────┴──────┐
    │             │
  Match         No Match
    │             │
    ↓             ↓
Mode A        Mode B
raceId      categoryId,
param       genderId,
            lengthId params
    │             │
    └──────┬──────┘
           ↓
    Navigate (SSR reload)</code></pre>
		</div>
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Features</h2>
		<ul class="list-disc space-y-2 pl-6 text-muted-foreground">
			<li>Three synchronized filter dropdowns (category, gender, distance)</li>
			<li>Intelligent race matching (Mode A vs Mode B)</li>
			<li>Translated filter options via i18n</li>
			<li>Prevents render blink with synchronous initial state computation</li>
			<li>SSR-friendly navigation with <code class="rounded bg-muted px-1.5 py-0.5">invalidateAll: true</code></li>
			<li>Responsive layout (wraps on mobile)</li>
			<li>Derived state for filter options</li>
		</ul>
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Filter Options (from Event)</h2>
		<div class="grid gap-6 md:grid-cols-3">
			<div class="rounded-lg border border-border bg-card p-6">
				<h3 class="mb-4 text-sm font-medium text-muted-foreground">Categories</h3>
				<ul class="space-y-2 text-sm">
					{#each mockEventWithRaces.supportedRaceCategories as category}
						<li>{category.name}</li>
					{/each}
				</ul>
			</div>
			<div class="rounded-lg border border-border bg-card p-6">
				<h3 class="mb-4 text-sm font-medium text-muted-foreground">Genders</h3>
				<ul class="space-y-2 text-sm">
					{#each mockEventWithRaces.supportedRaceCategoryGenders as gender}
						<li>{gender.name}</li>
					{/each}
				</ul>
			</div>
			<div class="rounded-lg border border-border bg-card p-6">
				<h3 class="mb-4 text-sm font-medium text-muted-foreground">Distances</h3>
				<ul class="space-y-2 text-sm">
					{#each mockEventWithRaces.supportedRaceCategoryLengths as length}
						<li>{length.name}</li>
					{/each}
				</ul>
			</div>
		</div>
	</section>

	<section>
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Usage</h2>
		<div class="rounded-lg border border-border bg-muted/50 p-6">
			<pre class="overflow-x-auto rounded bg-card p-4 text-sm text-card-foreground"><code>&lt;script lang="ts"&gt;
  import RaceFilterSelect from '$lib/components/custom/RaceFilterSelect/RaceFilterSelect.svelte';
  import type &#123; EventWithRaces &#125; from '$lib/types/services/events';

  let &#123; event, currentRaceId, filterState &#125;: &#123;
    event: EventWithRaces;
    currentRaceId?: string;
    filterState?: &#123;
      categoryId: string;
      genderId: string;
      lengthId: string;
    &#125; | null;
  &#125; = $props();
&lt;/script&gt;

&lt;!-- Mode A: With race ID --&gt;
&lt;RaceFilterSelect &#123;event&#125; &#123;currentRaceId&#125; /&gt;

&lt;!-- Mode B: With filter state (no matching race) --&gt;
&lt;RaceFilterSelect &#123;event&#125; &#123;filterState&#125; /&gt;</code></pre>
		</div>
	</section>
</div>

</Story>

<style>
	code {
		font-family: 'Monaco', 'Courier New', monospace;
	}
</style>

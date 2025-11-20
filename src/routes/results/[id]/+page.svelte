<script lang="ts">
	import { ResultsTable, RaceFilterSelect } from '$lib/components';
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.event.name} - {$t('events.results.title')} - ACS</title>
</svelte:head>

<section class="py-6 sm:py-8 md:py-10 lg:py-12">
	<h2 class="mb-8 text-3xl font-bold">{data.event.name}</h2>

	{#if data.event.races.length > 0}
		<RaceFilterSelect
			event={data.event}
			currentRaceId={data.race?.id}
			filterState={data.filterState}
		/>
	{/if}

	{#if data.race?.raceResults && data.race.raceResults.length > 0}
		<ResultsTable raceResults={data.race.raceResults} />
	{:else}
		<div class="rounded-lg border border-border bg-muted/50 py-12 text-center">
			<p class="mb-2 text-lg text-muted-foreground">
				{$t('races.noResults.title')}
			</p>
			<p class="text-sm text-muted-foreground">
				{$t('races.noResults.suggestion')}
			</p>
		</div>
	{/if}
</section>

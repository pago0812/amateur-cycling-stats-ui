<script lang="ts">
	import CyclistResultsTable from '$lib/components/CyclistResultsTable.svelte';
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.cyclist.name} {data.cyclist.lastName} - {$t('common.navigation.cyclists')} - ACS</title>
</svelte:head>

<section class="px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10 lg:py-12">
	<h2 class="text-3xl font-bold mb-8">
		{data.cyclist.name}
		{data.cyclist.lastName}
	</h2>

	{#if data.cyclist.raceResults && data.cyclist.raceResults.length > 0}
		<CyclistResultsTable raceResults={data.cyclist.raceResults} />
	{:else}
		<div class="text-center py-8 text-gray-500">
			{$t('cyclists.profile.noResults')}
		</div>
	{/if}
</section>

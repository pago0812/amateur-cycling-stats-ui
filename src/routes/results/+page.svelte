<script lang="ts">
	import EventResultsTable from '$lib/components/EventResultsTable.svelte';
	import SelectQueryParam from '$lib/components/SelectQueryParam.svelte';
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{$t('common.pageTitle.results')}</title>
</svelte:head>

<section class="py-6 sm:py-8 md:py-10 lg:py-12">
	<h2 class="mb-8 text-3xl font-bold">{$t('events.results.title')}</h2>

	<div class="mb-4 flex gap-4">
		<SelectQueryParam
			title={$t('common.general.year')}
			name="year"
			options={[
				{ value: '2025', t: '2025' },
				{ value: '2024', t: '2024' },
				{ value: '2023', t: '2023' },
				{ value: '2022', t: '2022' },
				{ value: '2021', t: '2021' },
				{ value: '2020', t: '2020' }
			]}
		/>
	</div>

	{#if data.error}
		<div class="rounded border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive">
			{data.error}
		</div>
	{:else if data.events.length === 0}
		<div class="py-8 text-center text-muted-foreground">{$t('events.results.noEvents')}</div>
	{:else}
		<EventResultsTable events={data.events} />
	{/if}
</section>

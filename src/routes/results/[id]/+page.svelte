<script lang="ts">
	import ResultsTable from '$lib/components/ResultsTable.svelte';
	import SelectQueryParam from '$lib/components/SelectQueryParam.svelte';
	import { t } from '$lib/i18n';
	import {
		translateCategory,
		translateGender,
		translateLength
	} from '$lib/i18n/category-translations';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Map categories to select options with translations
	const raceCategoryAgeOptions = $derived(
		data.event.supportedRaceCategories?.map((category) => ({
			value: category.id,
			t: translateCategory(category.name)
		})) || []
	);

	const raceCategoryLengthOptions = $derived(
		data.event.supportedRaceCategoryLengths?.map((category) => ({
			value: category.id,
			t: translateLength(category.name)
		})) || []
	);

	const raceCategoryGenderOptions = $derived(
		data.event.supportedRaceCategoryGenders?.map((category) => ({
			value: category.id,
			t: translateGender(category.name)
		})) || []
	);
</script>

<svelte:head>
	<title>{data.event.name} - {$t('events.results.title')} - ACS</title>
</svelte:head>

<section class="px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-12 lg:py-12">
	<h2 class="mb-8 text-3xl font-bold">{data.event.name}</h2>

	<div class="mb-4 flex flex-wrap gap-3">
		<SelectQueryParam
			name="category"
			title={$t('races.filters.category')}
			options={raceCategoryAgeOptions}
		/>
		<SelectQueryParam
			name="gender"
			title={$t('races.filters.gender')}
			options={raceCategoryGenderOptions}
		/>
		<SelectQueryParam
			name="length"
			title={$t('races.filters.distance')}
			options={raceCategoryLengthOptions}
		/>
	</div>

	{#if data.race?.raceResults && data.race.raceResults.length > 0}
		<ResultsTable raceResults={data.race.raceResults} />
	{:else}
		<div class="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center">
			<p class="mb-2 text-lg text-gray-600">
				{$t('races.noResults.title')}
			</p>
			<p class="text-sm text-gray-500">
				{$t('races.noResults.suggestion')}
			</p>
		</div>
	{/if}
</section>

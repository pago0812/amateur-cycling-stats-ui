<script lang="ts">
	import ResultsTable from '$lib/components/ResultsTable.svelte';
	import SelectQueryParam from '$lib/components/SelectQueryParam.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Map categories to select options with translations
	const raceCategoryAgeOptions = $derived(
		data.event.supportedRaceCategories?.map((category) => ({
			value: category.documentId,
			t: category.name // TODO: Add i18n translations
		})) || []
	);

	const raceCategoryLengthOptions = $derived(
		data.event.supportedRaceCategoryLengths?.map((category) => ({
			value: category.documentId,
			t: category.name // TODO: Add i18n translations
		})) || []
	);

	const raceCategoryGenderOptions = $derived(
		data.event.supportedRaceCategoryGenders?.map((category) => ({
			value: category.documentId,
			t: category.name // TODO: Add i18n translations
		})) || []
	);
</script>

<svelte:head>
	<title>{data.event.name} - Resultados - ACS</title>
</svelte:head>

<section class="px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10 lg:py-12">
	<h2 class="text-3xl font-bold mb-8">{data.event.name}</h2>

	<div class="mb-4 flex gap-3 flex-wrap">
		<SelectQueryParam
			name="category"
			title="Categoría"
			options={raceCategoryAgeOptions}
		/>
		<SelectQueryParam
			name="gender"
			title="Género"
			options={raceCategoryGenderOptions}
		/>
		<SelectQueryParam
			name="length"
			title="Distancia"
			options={raceCategoryLengthOptions}
		/>
	</div>

	{#if data.race?.raceResults && data.race.raceResults.length > 0}
		<ResultsTable raceResults={data.race.raceResults} />
	{:else}
		<div class="text-center py-8 text-gray-500">
			No hay resultados disponibles para esta combinación de filtros
		</div>
	{/if}
</section>

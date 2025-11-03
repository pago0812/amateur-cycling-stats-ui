<script lang="ts">
	import EventResultsTable from '$lib/components/EventResultsTable.svelte';
	import SelectQueryParam from '$lib/components/SelectQueryParam.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Resultados - ACS</title>
</svelte:head>

<section class="px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10 lg:py-12">
	<h2 class="text-3xl font-bold mb-8">Resultados</h2>

	<div class="mb-4 flex gap-4">
		<SelectQueryParam
			title="Año"
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
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
			{data.error}
		</div>
	{:else if data.events.length === 0}
		<div class="text-center py-8 text-gray-500">No hay eventos para mostrar</div>
	{:else}
		<EventResultsTable events={data.events} />
	{/if}
</section>

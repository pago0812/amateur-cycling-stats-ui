<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Inicio - ACS</title>
</svelte:head>

<section class="px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10">
	<h2 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">Próximos eventos</h2>

	{#if data.error}
		<div class="text-center py-8">
			<p class="text-red-600">Error: {data.error}</p>
		</div>
	{:else if data.events.length === 0}
		<div class="text-center py-8">
			<p class="text-gray-600">No hay eventos próximos disponibles.</p>
		</div>
	{:else}
		<div class="grid gap-4">
			{#each data.events as event (event.documentId)}
				<div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
					<h3 class="text-lg font-semibold text-gray-900">{event.name}</h3>
					{#if event.description}
						<p class="text-gray-600 mt-2">{event.description}</p>
					{/if}
					<div class="mt-3 text-sm text-gray-500">
						<p>Fecha: {new Date(event.dateTime).toLocaleDateString('es-ES')}</p>
						<p>Ubicación: {event.city ? `${event.city}, ` : ''}{event.state}, {event.country}</p>
						<p>Estado: {event.eventStatus}</p>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>

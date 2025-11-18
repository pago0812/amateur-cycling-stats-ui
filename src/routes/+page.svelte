<script lang="ts">
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{$t('common.pageTitle.home')}</title>
</svelte:head>

<section class="py-4 sm:py-6 md:py-8 lg:py-10">
	<h2 class="mb-4 text-2xl font-bold sm:mb-6 sm:text-3xl md:mb-8 md:text-4xl">
		{$t('events.home.title')}
	</h2>

	{#if data.error}
		<div class="py-8 text-center">
			<p class="text-destructive">{$t('common.general.error')}: {data.error}</p>
		</div>
	{:else if data.events.length === 0}
		<div class="py-8 text-center">
			<p class="text-muted-foreground">{$t('events.home.noResults')}</p>
		</div>
	{:else}
		<div class="grid gap-4">
			{#each data.events as event (event.id)}
				<div class="rounded-lg border border-border p-4 transition-shadow hover:shadow-md">
					<h3 class="text-lg font-semibold text-foreground">{event.name}</h3>
					{#if event.description}
						<p class="mt-2 text-muted-foreground">{event.description}</p>
					{/if}
					<div class="mt-3 text-sm text-muted-foreground">
						<p>{$t('events.home.date')}: {new Date(event.dateTime).toLocaleDateString('es-ES')}</p>
						<p>
							{$t('events.home.location')}: {event.city ? `${event.city}, ` : ''}{event.state}, {event.country}
						</p>
						<p>{$t('events.home.status')}: {event.eventStatus}</p>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>

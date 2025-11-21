<script lang="ts">
	import type { PageData } from './$types';
	import { t } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { MenuToolbar } from '$lib/components';
	import { Button } from '$lib/components/ui/button';
	import EventsTable from '$lib/components/custom/EventsTable/EventsTable.svelte';

	let { data }: { data: PageData } = $props();

	const filters = ['all', 'future', 'past'] as const;

	function setFilter(filter: string) {
		const url = new URL($page.url);
		if (filter === 'all') {
			url.searchParams.delete('filter');
		} else {
			url.searchParams.set('filter', filter);
		}
		goto(url.toString(), { replaceState: true });
	}
</script>

<svelte:head>
	<title>{$t('panel.events.title')} - ACS</title>
</svelte:head>

<MenuToolbar
	breadcrumbs={[{ label: $t('panel.title'), href: '/panel' }, { label: $t('panel.events.title') }]}
	actions={[
		{
			label: $t('panel.events.createButton'),
			href: '/panel/events/new',
			onClick: () => goto('/panel/events/new'),
			variant: 'default'
		}
	]}
/>

<div class="mt-8 space-y-6">
	<!-- Filter tabs -->
	<div class="flex gap-2">
		{#each filters as filter}
			<Button
				variant={data.filter === filter ? 'default' : 'outline'}
				size="sm"
				onclick={() => setFilter(filter)}
			>
				{$t(`panel.events.filter.${filter}`)}
			</Button>
		{/each}
	</div>

	<!-- Events table -->
	<EventsTable events={data.events} />
</div>

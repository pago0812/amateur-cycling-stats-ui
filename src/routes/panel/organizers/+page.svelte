<script lang="ts">
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{$t('panel.tabs.manageOrganizers')} - ACS</title>
</svelte:head>

<div class="rounded-lg bg-gray-50 p-8 text-center">
	<h2 class="mb-4 text-2xl font-bold">{$t('panel.organizers.title')}</h2>
	<p class="mb-2 text-lg text-gray-600">{$t('panel.organizers.comingSoon')}</p>
	<p class="text-sm text-gray-500">
		{$t('panel.organizers.description')}
	</p>
</div>

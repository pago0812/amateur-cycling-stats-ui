<script lang="ts">
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{$t('panel.tabs.manageOrganization')} - ACS</title>
</svelte:head>

<div class="bg-gray-50 rounded-lg p-8 text-center">
	<h2 class="text-2xl font-bold mb-4">{$t('panel.organization.title')}</h2>
	<p class="text-gray-600 text-lg mb-2">{$t('panel.organization.comingSoon')}</p>
	<p class="text-gray-500 text-sm">
		{$t('panel.organization.description')}
	</p>
</div>

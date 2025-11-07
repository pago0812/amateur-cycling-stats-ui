<script lang="ts">
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{$t('panel.tabs.manageOrganizations')} - ACS</title>
</svelte:head>

<div class="bg-gray-50 rounded-lg p-8 text-center">
	<div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
		<span class="text-3xl">🔒</span>
	</div>
	<h2 class="text-2xl font-bold mb-4">{$t('panel.organizations.title')}</h2>
	<p class="text-gray-600 text-lg mb-2">{$t('panel.organizations.comingSoon')}</p>
	<p class="text-gray-500 text-sm">
		{$t('panel.organizations.description')}
	</p>
	<p class="text-xs text-blue-600 mt-4">
		{$t('panel.organizations.adminOnly')}
	</p>
</div>

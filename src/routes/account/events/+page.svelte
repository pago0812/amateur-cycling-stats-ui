<script lang="ts">
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{$t('account.tabs.upcomingEvents')} - ACS</title>
</svelte:head>

<div class="bg-gray-50 rounded-lg p-8 text-center">
	<p class="text-gray-600 text-lg mb-2">{$t('account.upcomingEvents.comingSoon')}</p>
	<p class="text-gray-500 text-sm">
		{$t('account.upcomingEvents.description')}
	</p>
</div>

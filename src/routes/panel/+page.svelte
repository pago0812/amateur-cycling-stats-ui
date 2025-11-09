<script lang="ts">
	import OrganizationProfile from '$lib/components/OrganizationProfile.svelte';
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{$t('panel.tabs.overview')} - ACS</title>
</svelte:head>

{#if data.organization}
	<!-- Organization details -->
	<OrganizationProfile organization={data.organization} />
{:else}
	<!-- Fallback if organization not loaded -->
	<div class="rounded-lg bg-gray-50 p-8 text-center">
		<h2 class="mb-4 text-2xl font-bold">{$t('panel.overview.title')}</h2>
		<p class="mb-2 text-lg text-gray-600">{$t('panel.overview.comingSoon')}</p>
		<p class="text-sm text-gray-500">
			{$t('panel.overview.description')}
		</p>
	</div>
{/if}

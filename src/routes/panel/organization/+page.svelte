<script lang="ts">
	import OrganizationProfile from '$lib/components/OrganizationProfile.svelte';
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{$t('panel.organization.tabs.overview')} - ACS</title>
</svelte:head>

{#if data.organization}
	<div class="mt-8">
		<!-- Organization details -->
		<OrganizationProfile organization={data.organization} />
	</div>
{:else}
	<!-- Fallback if organization not loaded -->
	<div class="mt-8 rounded-lg bg-gray-50 p-8 text-center">
		<p class="text-lg text-gray-600">{$t('panel.organization.errors.notFound')}</p>
	</div>
{/if}

<script lang="ts">
	import { t } from '$lib/i18n';
	import SecondaryToolbar from '$lib/components/SecondaryToolbar.svelte';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	// Define navigation tabs for organizers
	const tabs = [
		{ path: '/panel', label: $t('panel.tabs.overview') },
		{ path: '/panel/events', label: $t('panel.tabs.manageEvents') },
		{ path: '/panel/organizers', label: $t('panel.tabs.manageOrganizers') }
	];
</script>

<div class="px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-12 lg:py-12">
	<!-- Page Header -->
	<div class="mb-8">
		<h1 class="mb-2 text-4xl font-bold">{$t('panel.title')}</h1>
		<p class="text-gray-600">{$t('panel.subtitle')}</p>
	</div>

	<!-- Secondary Navigation Toolbar -->
	<SecondaryToolbar {tabs} showLogout={true} />

	<!-- Page Content -->
	<div>
		{@render children()}
	</div>
</div>

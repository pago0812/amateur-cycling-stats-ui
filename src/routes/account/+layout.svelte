<script lang="ts">
	import { t } from '$lib/i18n';
	import SecondaryToolbar from '$lib/components/SecondaryToolbar.svelte';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	// Define navigation tabs for cyclist account
	const tabs = [
		{ path: '/account', label: $t('account.tabs.profile') },
		{ path: '/account/events', label: $t('account.tabs.upcomingEvents') }
	];
</script>

<div class="px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10 lg:py-12">
	<!-- Page Header -->
	<div class="mb-8">
		<h1 class="text-4xl font-bold mb-2">{$t('account.title')}</h1>
		<p class="text-gray-600">{$t('account.subtitle')}</p>
	</div>

	<!-- Secondary Navigation Toolbar -->
	<SecondaryToolbar {tabs} showLogout={true} />

	<!-- Page Content -->
	<div>
		{@render children()}
	</div>
</div>

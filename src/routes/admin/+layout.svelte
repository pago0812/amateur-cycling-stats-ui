<script lang="ts">
	import { t } from '$lib/i18n';
	import SecondaryToolbar from '$lib/components/SecondaryToolbar.svelte';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { children }: { data: LayoutData; children: Snippet } = $props();

	// Define navigation tabs for admin
	const tabs = [{ path: '/admin', label: $t('admin.tabs.generalConfig') }];
</script>

<div class="px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-12 lg:py-12">
	<!-- Page Header -->
	<div class="mb-8">
		<h1 class="mb-2 text-4xl font-bold">{$t('admin.title')}</h1>
		<p class="text-gray-600">{$t('admin.subtitle')}</p>
	</div>

	<!-- Secondary Navigation Toolbar -->
	<SecondaryToolbar {tabs} showLogout={true} />

	<!-- Page Content -->
	<div>
		{@render children()}
	</div>
</div>

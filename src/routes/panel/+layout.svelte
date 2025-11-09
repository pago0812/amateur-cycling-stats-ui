<script lang="ts">
	import { t } from '$lib/i18n';
	import TertiaryToolbar from '$lib/components/TertiaryToolbar.svelte';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	// Define breadcrumb for panel (single item - current organization/panel)
	const breadcrumbs = [{ label: $t('panel.title') }];

	// Define tertiary navigation tabs for panel
	const tabs = [
		{ path: '/panel', label: $t('panel.tabs.overview') },
		{ path: '/panel/members', label: $t('panel.tabs.members') }
	];
</script>

<div class="py-8">
	<!-- Page Header -->
	<div class="mb-8">
		<h1 class="mb-2 text-4xl font-bold">{$t('panel.title')}</h1>
		<p class="text-gray-600">{$t('panel.subtitle')}</p>
	</div>

	<!-- Tertiary Toolbar with breadcrumbs, tabs, and logout -->
	<TertiaryToolbar {breadcrumbs} {tabs} showLogout={true} />

	<!-- Page Content -->
	<div>
		{@render children()}
	</div>
</div>

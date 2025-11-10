<script lang="ts">
	import { t } from '$lib/i18n';
	import MenuToolbar from '$lib/components/MenuToolbar.svelte';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	// Define breadcrumbs for organization detail
	// Shows: Summary (link back) → Organization Name (current)
	const breadcrumbs = $derived([
		{ label: data.organization?.name ?? $t('panel.breadcrumbs.myOrganization') }
	]);

	// Define navigation tabs for organization detail
	const tabs = [
		{
			path: '/panel/organization',
			label: $t('panel.organization.tabs.overview')
		},
		{
			path: '/panel/organization/members',
			label: $t('panel.organization.tabs.members')
		}
	];
</script>

<section>
	<!-- Secondary Menu Toolbar with breadcrumbs and tabs -->
	{#if data.organization}
		<MenuToolbar {breadcrumbs} {tabs} level="secondary" />
	{/if}

	<!-- Page Content -->
	<div>
		{@render children()}
	</div>
</section>

<script lang="ts">
	import { t } from '$lib/i18n';
	import TertiaryToolbar from '$lib/components/TertiaryToolbar.svelte';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	// Define breadcrumbs for organization detail
	const breadcrumbs = [
		{ label: $t('admin.breadcrumbs.allOrganizations'), href: '/admin/organizations' },
		{ label: data.organization.name } // Current page
	];

	// Define tertiary navigation tabs for organization detail
	const tabs = [
		{
			path: `/admin/organizations/${data.organization.id}`,
			label: $t('admin.organizations.tabs.overview')
		},
		{
			path: `/admin/organizations/${data.organization.id}/members`,
			label: $t('admin.organizations.tabs.members')
		}
	];
</script>

<section>
	<!-- Tertiary Toolbar with breadcrumbs and tabs -->
	<TertiaryToolbar {breadcrumbs} {tabs} />

	<!-- Page Content -->
	<div>
		{@render children()}
	</div>
</section>

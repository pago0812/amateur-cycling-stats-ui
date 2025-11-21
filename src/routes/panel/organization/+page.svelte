<script lang="ts">
	import { OrganizationProfile, MenuToolbar } from '$lib/components';
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const breadcrumbs = [
		{ label: data.organization.name, href: '/panel' },
		{ label: $t('panel.tabs.organization') }
	];
	// Define navigation tabs for panel section
	const tabs = [
		{ path: '/panel', label: $t('panel.tabs.summary') },
		{ path: '/panel/organization', label: $t('panel.tabs.organization') },
		{ path: '/panel/members', label: $t('panel.tabs.members') },
		{ path: '/panel/events', label: $t('panel.tabs.events') }
	];
</script>

<svelte:head>
	<title>{$t('panel.organization.tabs.overview')} - ACS</title>
</svelte:head>

{#if data.organization}
	<!-- Menu Toolbar with breadcrumbs and tabs -->
	<MenuToolbar {breadcrumbs} {tabs} />
	<div class="mt-8">
		<!-- Organization details -->
		<OrganizationProfile organization={data.organization} />
	</div>
{:else}
	<!-- Fallback if organization not loaded -->
	<div class="mt-8 rounded-lg bg-muted/50 p-8 text-center">
		<p class="text-lg text-muted-foreground">{$t('panel.organization.errors.notFound')}</p>
	</div>
{/if}

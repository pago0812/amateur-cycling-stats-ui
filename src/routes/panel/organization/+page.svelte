<script lang="ts">
	import OrganizationProfile from '$lib/components/OrganizationProfile.svelte';
	import MenuToolbar from '$lib/components/MenuToolbar.svelte';
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Define tabs for organization detail pages
	const tabs = data.organization
		? [
				{
					path: '/panel/organization',
					label: $t('panel.organization.tabs.overview')
				},
				{
					path: '/panel/organization/members',
					label: $t('panel.organization.tabs.members')
				}
			]
		: undefined;
</script>

<svelte:head>
	<title>{$t('panel.organization.tabs.overview')} - ACS</title>
</svelte:head>

{#if data.organization}
	<!-- Menu Toolbar with breadcrumbs and tabs -->
	<MenuToolbar
		breadcrumbs={[{ label: $t('panel.title'), href: '/panel' }, { label: data.organization.name }]}
		{tabs}
	/>
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

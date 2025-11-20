<script lang="ts">
	import { MembersTable, MenuToolbar } from '$lib/components';
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
	<title>{$t('panel.organization.tabs.members')} - ACS</title>
</svelte:head>

{#if data.organization}
	<!-- Menu Toolbar with breadcrumbs and tabs -->
	<MenuToolbar
		breadcrumbs={[
			{ label: $t('panel.title'), href: '/panel' },
			{ label: $t('panel.tabs.organization'), href: '/panel/organization' },
			{ label: data.organization.name }
		]}
		{tabs}
	/>
{/if}

<div class="mt-8">
	<!-- Error message if organizers failed to load -->
	{#if data.error}
		<div class="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-4">
			<p class="text-sm text-destructive">
				{$t('common.members.errors.loadFailed')}: {data.error}
			</p>
		</div>
	{/if}

	<!-- Members table -->
	<MembersTable organizers={data.organizers} />
</div>

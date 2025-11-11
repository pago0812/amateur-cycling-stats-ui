<script lang="ts">
	import MembersTable from '$lib/components/MembersTable.svelte';
	import MenuToolbar from '$lib/components/MenuToolbar.svelte';
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{$t('admin.organizations.tabs.members')} - {$t('admin.organizations.title')} - ACS</title>
</svelte:head>

<section>
	<!-- Menu Toolbar with breadcrumbs and tabs (no edit action) -->
	<MenuToolbar
		breadcrumbs={[
			{ label: $t('admin.breadcrumbs.allOrganizations'), href: '/admin/organizations' },
			{ label: data.organization.name }
		]}
		tabs={[
			{
				path: `/admin/organizations/${data.organization.id}`,
				label: $t('admin.organizations.tabs.overview')
			},
			{
				path: `/admin/organizations/${data.organization.id}/members`,
				label: $t('admin.organizations.tabs.members')
			}
		]}
		level="secondary"
	/>

	<div class="mt-8">
		<!-- Error message if organizers failed to load -->
		{#if data.error}
			<div class="mb-6 rounded-md border border-red-300 bg-red-50 p-4">
				<p class="text-sm text-red-800">
					{$t('common.members.errors.loadFailed')}: {data.error}
				</p>
			</div>
		{/if}

		<!-- Members table -->
		<MembersTable organizers={data.organizers} />
	</div>
</section>

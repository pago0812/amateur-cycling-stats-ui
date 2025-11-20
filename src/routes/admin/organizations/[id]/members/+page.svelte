<script lang="ts">
	import { MembersTable, MenuToolbar } from '$lib/components';
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Add member handler - TODO: implement member creation functionality
	const handleAddMember = () => {
		// TODO: Navigate to add member page or open modal
		console.log('Add member functionality to be implemented');
	};
</script>

<svelte:head>
	<title>{$t('admin.organizations.tabs.members')} - {$t('admin.organizations.title')} - ACS</title>
</svelte:head>

<section>
	<!-- Menu Toolbar with breadcrumbs and Add member action -->
	<MenuToolbar
		breadcrumbs={[
			{ label: $t('admin.title'), href: '/admin' },
			{ label: $t('admin.breadcrumbs.organizations'), href: '/admin/organizations' },
			{
				label: data.organization.name,
				href: `/admin/organizations/${data.organization.id}`
			},
			{ label: $t('admin.breadcrumbs.members') }
		]}
		actions={[
			{
				label: $t('admin.organizations.actions.addMember'),
				onClick: handleAddMember,
				variant: 'default'
			}
		]}
	/>

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
</section>

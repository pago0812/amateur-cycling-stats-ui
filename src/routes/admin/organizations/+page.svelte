<script lang="ts">
	import OrganizationsTable from '$lib/components/OrganizationsTable.svelte';
	import MenuToolbar from '$lib/components/MenuToolbar.svelte';
	import { t } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Add organization handler - navigate to new page
	const handleAddOrganization = () => {
		goto('/admin/organizations/new');
	};
</script>

<svelte:head>
	<title>{$t('admin.organizations.title')} - ACS</title>
</svelte:head>

<section>
	<!-- Menu Toolbar with breadcrumb and Add button -->
	<MenuToolbar
		breadcrumbs={[
			{ label: $t('admin.title'), href: '/admin' },
			{ label: $t('admin.breadcrumbs.organizations') }
		]}
		actions={[
			{
				label: $t('admin.organizations.addButton'),
				onClick: handleAddOrganization,
				variant: 'primary'
			}
		]}
	/>
	<!-- Error message if organizations failed to load -->
	{#if data.error}
		<div class="mb-6 rounded-md border border-red-300 bg-red-50 p-4">
			<p class="text-sm text-red-800">
				{$t('admin.organizations.errors.loadFailed')}: {data.error}
			</p>
		</div>
	{/if}

	<!-- Organizations table -->
	<div class="mt-8">
		<OrganizationsTable organizations={data.organizations} />
	</div>
</section>

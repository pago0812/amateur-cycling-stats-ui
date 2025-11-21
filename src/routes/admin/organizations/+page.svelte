<script lang="ts">
	import { OrganizationsTable, MenuToolbar } from '$lib/components';
	import { t } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const handleAddOrganization = () => {
		goto('/admin/organizations/new');
	};

	const breadcrumbs = [
		{ label: $t('admin.title'), href: '/admin' },
		{ label: $t('admin.breadcrumbs.organizations') }
	];

	const actions = [
		{
			label: $t('admin.organizations.addButton'),
			onClick: handleAddOrganization,
			variant: 'default' as const
		}
	];
</script>

<svelte:head>
	<title>{$t('admin.organizations.title')} - ACS</title>
</svelte:head>

<section>
	<MenuToolbar {breadcrumbs} {actions} />
	<!-- Error message if organizations failed to load -->
	{#if data.error}
		<div class="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-4">
			<p class="text-sm text-destructive">
				{$t('admin.organizations.errors.loadFailed')}: {data.error}
			</p>
		</div>
	{/if}

	<!-- Organizations table -->
	<div class="mt-8">
		<OrganizationsTable organizations={data.organizations} />
	</div>
</section>

<script lang="ts">
	import OrganizationsTable from '$lib/components/OrganizationsTable.svelte';
	import TertiaryToolbar from '$lib/components/TertiaryToolbar.svelte';
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{$t('admin.organizations.title')} - ACS</title>
</svelte:head>

<section>
	<!-- Tertiary Toolbar with breadcrumb -->
	<TertiaryToolbar breadcrumbs={[{ label: $t('admin.breadcrumbs.allOrganizations') }]} />

	<!-- Add button -->
	<div class="mb-6 flex justify-end">
		<a
			href="/admin/organizations/new"
			class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
		>
			{$t('admin.organizations.addButton')}
		</a>
	</div>

	<!-- Error message if organizations failed to load -->
	{#if data.error}
		<div class="mb-6 rounded-md border border-red-300 bg-red-50 p-4">
			<p class="text-sm text-red-800">
				{$t('admin.organizations.errors.loadFailed')}: {data.error}
			</p>
		</div>
	{/if}

	<!-- Organizations table -->
	<OrganizationsTable organizations={data.organizations} />
</section>

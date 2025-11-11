<script lang="ts">
	import OrganizationProfile from '$lib/components/OrganizationProfile.svelte';
	import MenuToolbar from '$lib/components/MenuToolbar.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import { enhance } from '$app/forms';
	import { t } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import { alertStore } from '$lib/stores/alert-store';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Modal state
	let isDeleteModalOpen = $state(false);

	// Delete form reference
	let deleteForm: HTMLFormElement = $state()!;

	// Edit organization handler - navigate to edit page
	const handleEditOrganization = () => {
		goto(`/admin/organizations/${data.organization.id}/edit`);
	};

	// Delete organization handler - show confirmation modal
	const handleDeleteOrganization = () => {
		isDeleteModalOpen = true;
	};

	// Confirm deletion - submit form
	const handleConfirmDelete = () => {
		deleteForm.requestSubmit();
		isDeleteModalOpen = false;
	};

	// Cancel deletion
	const handleCancelDelete = () => {
		isDeleteModalOpen = false;
	};
</script>

<svelte:head>
	<title>{data.organization.name} - {$t('admin.organizations.title')} - ACS</title>
</svelte:head>

<!-- Hidden delete form -->
<form
	method="POST"
	action="?/delete"
	bind:this={deleteForm}
	class="hidden"
	use:enhance={() => {
		return async ({ result, update }) => {
			// Only show success alert if redirect happened (successful deletion)
			if (result.type === 'redirect') {
				alertStore.openAlert($t('admin.organizations.success.deleted'), 'success');
			}
			await update();
		};
	}}
></form>

<section>
	<!-- Menu Toolbar with breadcrumbs, tabs, and actions -->
	<MenuToolbar
		breadcrumbs={[
			{ label: $t('admin.title'), href: '/admin' },
			{ label: $t('admin.breadcrumbs.organizations'), href: '/admin/organizations' },
			{ label: data.organization.name }
		]}
		tabs={[
			{
				path: `/admin/organizations/${data.organization.id}`,
				label: $t('admin.organizations.tabs.generalInformation')
			},
			{
				path: `/admin/organizations/${data.organization.id}/members`,
				label: $t('admin.organizations.tabs.members')
			}
		]}
		actions={[
			{
				label: $t('admin.organizations.editButton'),
				onClick: handleEditOrganization,
				variant: 'primary'
			},
			{
				label: $t('admin.organizations.actions.deleteOrganization'),
				onClick: handleDeleteOrganization,
				variant: 'danger'
			}
		]}
	/>

	<!-- Organization details -->
	<div class="mt-8">
		<OrganizationProfile organization={data.organization} />
	</div>
</section>

<!-- Delete Confirmation Modal -->
<ConfirmModal
	open={isDeleteModalOpen}
	title={$t('admin.organizations.deleteConfirm.title')}
	message={`${$t('admin.organizations.deleteConfirm.message').replace('{name}', data.organization.name)}`}
	confirmText={$t('admin.organizations.deleteConfirm.confirm')}
	cancelText={$t('admin.organizations.deleteConfirm.cancel')}
	variant="danger"
	onConfirm={handleConfirmDelete}
	onCancel={handleCancelDelete}
/>

<script lang="ts">
	import { OrganizationProfile, MenuToolbar, ConfirmModal } from '$lib/components';
	import { enhance } from '$app/forms';
	import { t } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import { alertStore } from '$lib/stores/alert-store';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Modal states
	let isDeactivateModalOpen = $state(false);
	let isActivateModalOpen = $state(false);
	let isPermanentDeleteModalOpen = $state(false);

	// Form references
	let deactivateForm: HTMLFormElement = $state()!;
	let activateForm: HTMLFormElement = $state()!;
	let permanentDeleteForm: HTMLFormElement = $state()!;
	let resendForm: HTMLFormElement = $state()!;

	// Edit organization handler - navigate to edit page
	const handleEditOrganization = () => {
		goto(`/admin/organizations/${data.organization.id}/edit`);
	};

	// Deactivate organization handler - show confirmation modal
	const handleDeactivateOrganization = () => {
		isDeactivateModalOpen = true;
	};

	// Activate organization handler - show confirmation modal
	const handleActivateOrganization = () => {
		isActivateModalOpen = true;
	};

	// Permanent delete handler - show confirmation modal
	const handlePermanentDelete = () => {
		isPermanentDeleteModalOpen = true;
	};

	// Resend invite handler
	const handleResendInvite = () => {
		resendForm.requestSubmit();
	};

	// Confirm deactivation - submit form
	const handleConfirmDeactivate = () => {
		deactivateForm.requestSubmit();
		isDeactivateModalOpen = false;
	};

	// Cancel deactivation
	const handleCancelDeactivate = () => {
		isDeactivateModalOpen = false;
	};

	// Confirm activation - submit form
	const handleConfirmActivate = () => {
		activateForm.requestSubmit();
		isActivateModalOpen = false;
	};

	// Cancel activation
	const handleCancelActivate = () => {
		isActivateModalOpen = false;
	};

	// Confirm permanent deletion - submit form
	const handleConfirmPermanentDelete = () => {
		permanentDeleteForm.requestSubmit();
		isPermanentDeleteModalOpen = false;
	};

	// Cancel permanent deletion
	const handleCancelPermanentDelete = () => {
		isPermanentDeleteModalOpen = false;
	};

	// Show success message from resend invite action
	$effect(() => {
		if (form?.success && form?.message) {
			alertStore.openAlert(form.message, 'success');
		}
		if (form?.error) {
			alertStore.openAlert(form.error, 'error');
		}
	});

	const breadcrumbs = [
		{ label: $t('admin.title'), href: '/admin' },
		{ label: $t('admin.breadcrumbs.organizations'), href: '/admin/organizations' },
		{ label: data.organization.name }
	];

	const tabs = [
		{
			path: `/admin/organizations/${data.organization.id}`,
			label: $t('admin.organizations.tabs.generalInformation')
		},
		{
			path: `/admin/organizations/${data.organization.id}/members`,
			label: $t('admin.organizations.tabs.members')
		}
	];

	const actions = (() => {
		const { state, eventCount } = data.organization;
		const hasNoEntities = eventCount === 0 && data.organizersCount === 0;

		// ACTIVE state: Show Edit + Deactivate
		if (state === 'ACTIVE') {
			return [
				{
					label: $t('admin.organizations.editButton'),
					onClick: handleEditOrganization,
					variant: 'default' as const
				},
				{
					label: $t('admin.organizations.actions.deactivateOrganization'),
					onClick: handleDeactivateOrganization,
					variant: 'destructive' as const
				}
			];
		}

		// WAITING_OWNER state: Show Resend Invite + Edit + Deactivate
		if (state === 'WAITING_OWNER') {
			return [
				{
					label: $t('admin.organizations.actions.resendInvite'),
					onClick: handleResendInvite,
					variant: 'secondary' as const
				},
				{
					label: $t('admin.organizations.editButton'),
					onClick: handleEditOrganization,
					variant: 'default' as const
				},
				{
					label: $t('admin.organizations.actions.deactivateOrganization'),
					onClick: handleDeactivateOrganization,
					variant: 'destructive' as const
				}
			];
		}

		// DISABLED state with entities: Show Activate only
		if (state === 'DISABLED' && !hasNoEntities) {
			return [
				{
					label: $t('admin.organizations.actions.activateOrganization'),
					onClick: handleActivateOrganization,
					variant: 'default' as const
				}
			];
		}

		// DISABLED state with no entities: Show Activate + Delete Permanently
		if (state === 'DISABLED' && hasNoEntities) {
			return [
				{
					label: $t('admin.organizations.actions.activateOrganization'),
					onClick: handleActivateOrganization,
					variant: 'default' as const
				},
				{
					label: $t('admin.organizations.actions.deletePermanently'),
					onClick: handlePermanentDelete,
					variant: 'destructive' as const
				}
			];
		}

		// Fallback (should never reach here)
		return [];
	})();
</script>

<svelte:head>
	<title>{data.organization.name} - {$t('admin.organizations.title')} - ACS</title>
</svelte:head>

<!-- Hidden resend invite form -->
<form
	method="POST"
	action="?/resendInvite"
	bind:this={resendForm}
	class="hidden"
	use:enhance={() => {
		return async ({ update }) => {
			await update();
		};
	}}
></form>

<!-- Hidden deactivate form -->
<form
	method="POST"
	action="?/deactivate"
	bind:this={deactivateForm}
	class="hidden"
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'redirect') {
				alertStore.openAlert($t('admin.organizations.success.deactivated'), 'success');
			}
			await update();
		};
	}}
></form>

<!-- Hidden activate form -->
<form
	method="POST"
	action="?/activate"
	bind:this={activateForm}
	class="hidden"
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'redirect') {
				alertStore.openAlert($t('admin.organizations.success.activated'), 'success');
			}
			await update();
		};
	}}
></form>

<!-- Hidden permanent delete form -->
<form
	method="POST"
	action="?/permanentDelete"
	bind:this={permanentDeleteForm}
	class="hidden"
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'redirect') {
				alertStore.openAlert($t('admin.organizations.success.permanentlyDeleted'), 'success');
			}
			await update();
		};
	}}
></form>

<section>
	<MenuToolbar {breadcrumbs} {tabs} {actions} />

	<!-- Organization details -->
	<div class="mt-8">
		<OrganizationProfile organization={data.organization} />
	</div>
</section>

<!-- Deactivate Confirmation Modal -->
<ConfirmModal
	open={isDeactivateModalOpen}
	title={$t('admin.organizations.deactivateConfirm.title')}
	message={`${$t('admin.organizations.deactivateConfirm.message').replace('{name}', data.organization.name)}`}
	confirmText={$t('admin.organizations.deactivateConfirm.confirm')}
	cancelText={$t('admin.organizations.deactivateConfirm.cancel')}
	variant="danger"
	onConfirm={handleConfirmDeactivate}
	onCancel={handleCancelDeactivate}
/>

<!-- Activate Confirmation Modal -->
<ConfirmModal
	open={isActivateModalOpen}
	title={$t('admin.organizations.activateConfirm.title')}
	message={`${$t('admin.organizations.activateConfirm.message').replace('{name}', data.organization.name)}`}
	confirmText={$t('admin.organizations.activateConfirm.confirm')}
	cancelText={$t('admin.organizations.activateConfirm.cancel')}
	variant="primary"
	onConfirm={handleConfirmActivate}
	onCancel={handleCancelActivate}
/>

<!-- Permanent Delete Confirmation Modal -->
<ConfirmModal
	open={isPermanentDeleteModalOpen}
	title={$t('admin.organizations.deletePermanentlyConfirm.title')}
	message={`${$t('admin.organizations.deletePermanentlyConfirm.message').replace('{name}', data.organization.name)}`}
	confirmText={$t('admin.organizations.deletePermanentlyConfirm.confirm')}
	cancelText={$t('admin.organizations.deletePermanentlyConfirm.cancel')}
	variant="danger"
	onConfirm={handleConfirmPermanentDelete}
	onCancel={handleCancelPermanentDelete}
/>

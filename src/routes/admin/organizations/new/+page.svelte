<script lang="ts">
	import { MenuToolbar, OrganizationForm } from '$lib/components';
	import { t } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import { alertStore } from '$lib/stores/alert-store';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	// Form reference for toolbar submit action
	let organizationForm: HTMLFormElement = $state()!;

	// Track if we've already processed this form submission
	let hasProcessedForm = $state(false);

	// Handle form submission from toolbar
	function handleSubmit() {
		organizationForm.requestSubmit();
	}

	// Show success message and redirect after successful creation
	$effect(() => {
		if (form && !hasProcessedForm) {
			hasProcessedForm = true;

			if (form.success && form.organizationId) {
				alertStore.openAlert($t('admin.organizations.success.created'), 'success');
				goto(`/admin/organizations/${form.organizationId as string}`);
			} else if (form.error) {
				alertStore.openAlert(form.error as string, 'error');
			}
		}
	});

	// Reset flag when form becomes null (after navigation)
	$effect(() => {
		if (!form) {
			hasProcessedForm = false;
		}
	});

	const breadcrumbs = [
		{ label: $t('admin.title'), href: '/admin' },
		{ label: $t('admin.breadcrumbs.organizations'), href: '/admin/organizations' },
		{ label: $t('admin.breadcrumbs.newOrganization') }
	];

	const actions = [
		{
			label: $t('admin.organizations.form.submitCreate'),
			onClick: handleSubmit,
			variant: 'default' as const
		}
	];
</script>

<svelte:head>
	<title>{$t('admin.organizations.form.createTitle')} - ACS</title>
</svelte:head>

<section>
	<MenuToolbar {breadcrumbs} {actions} />

	<!-- Organization Form -->
	<div class="mt-8">
		<OrganizationForm bind:formElement={organizationForm} mode="create" {form} />
	</div>
</section>

<script lang="ts">
	import MenuToolbar from '$lib/components/MenuToolbar.svelte';
	import OrganizationForm from '$lib/components/OrganizationForm.svelte';
	import { t } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import { alertStore } from '$lib/stores/alert-store';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Form reference for toolbar submit action
	let organizationForm: HTMLFormElement = $state()!;

	// Track if we've already processed this form submission
	let hasProcessedForm = $state(false);

	// Handle form submission from toolbar
	function handleSubmit() {
		organizationForm.requestSubmit();
	}

	// Show success message and redirect after successful update
	$effect(() => {
		if (form && !hasProcessedForm) {
			hasProcessedForm = true;

			if (form.success) {
				alertStore.openAlert($t('admin.organizations.success.updated'), 'success');
				goto(`/admin/organizations/${data.organization.id}`);
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
</script>

<svelte:head>
	<title>{$t('admin.organizations.form.editTitle')} - {data.organization.name} - ACS</title>
</svelte:head>

<section>
	<!-- Menu Toolbar with breadcrumbs and submit action -->
	<MenuToolbar
		breadcrumbs={[
			{ label: $t('admin.breadcrumbs.allOrganizations'), href: '/admin/organizations' },
			{
				label: data.organization.name,
				href: `/admin/organizations/${data.organization.id}`
			},
			{ label: $t('admin.organizations.form.editTitle') }
		]}
		actions={[
			{
				label: $t('admin.organizations.form.submitUpdate'),
				onClick: handleSubmit,
				variant: 'primary'
			}
		]}
		level="secondary"
	/>

	<!-- Organization Form with pre-filled data -->
	<div class="mt-8">
		<OrganizationForm
			bind:formElement={organizationForm}
			mode="edit"
			initialData={{
				name: data.organization.name,
				description: data.organization.description
			}}
			{form}
		/>
	</div>
</section>

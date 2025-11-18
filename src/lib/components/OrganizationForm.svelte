<script lang="ts">
	import { enhance } from '$app/forms';
	import { t } from '$lib/i18n';

	interface OrganizationFormProps {
		mode: 'create' | 'edit';
		formElement?: HTMLFormElement;
		initialData?: {
			name?: string;
			description?: string | null;
		};
		form?: Record<string, unknown> | null;
		action?: string;
	}

	let {
		mode,
		formElement = $bindable(),
		initialData,
		form,
		action
	}: OrganizationFormProps = $props();

	// Form state
	let isSubmitting = $state(false);
</script>

<form
	bind:this={formElement}
	method="POST"
	{action}
	use:enhance={() => {
		isSubmitting = true;
		return async ({ update }) => {
			await update();
			isSubmitting = false;
		};
	}}
	class="flex flex-col gap-6"
>
	<!-- Name Field -->
	<div class="flex flex-col gap-2">
		<label for="name" class="text-sm font-medium text-foreground/90">
			{$t('admin.organizations.form.nameLabel')}
			<span class="text-destructive">*</span>
		</label>
		<input
			type="text"
			id="name"
			name="name"
			required
			minlength="3"
			maxlength="255"
			value={(form?.name as string) || initialData?.name || ''}
			placeholder={$t('admin.organizations.form.namePlaceholder')}
			class="rounded-md border border-border px-4 py-2 focus:border-primary focus:ring-2 focus:ring-ring focus:outline-none"
			disabled={isSubmitting}
		/>
	</div>

	<!-- Description Field -->
	<div class="flex flex-col gap-2">
		<label for="description" class="text-sm font-medium text-foreground/90">
			{$t('admin.organizations.form.descriptionLabel')}
		</label>
		<textarea
			id="description"
			name="description"
			rows="4"
			maxlength="1000"
			value={(form?.description as string) || initialData?.description || ''}
			placeholder={$t('admin.organizations.form.descriptionPlaceholder')}
			class="resize-vertical rounded-md border border-border px-4 py-2 focus:border-primary focus:ring-2 focus:ring-ring focus:outline-none"
			disabled={isSubmitting}
		></textarea>
	</div>

	<!-- Owner fields - Only show in create mode -->
	{#if mode === 'create'}
		<!-- Owner Email Field -->
		<div class="flex flex-col gap-2">
			<label for="ownerEmail" class="text-sm font-medium text-foreground/90">
				{$t('admin.organizations.form.ownerEmailLabel')}
				<span class="text-destructive">*</span>
			</label>
			<input
				type="email"
				id="ownerEmail"
				name="ownerEmail"
				required
				value={(form?.ownerEmail as string) || ''}
				placeholder={$t('admin.organizations.form.ownerEmailPlaceholder')}
				class="rounded-md border border-border px-4 py-2 focus:border-primary focus:ring-2 focus:ring-ring focus:outline-none"
				disabled={isSubmitting}
			/>
		</div>

		<!-- Owner Name Field -->
		<div class="flex flex-col gap-2">
			<label for="ownerName" class="text-sm font-medium text-foreground/90">
				{$t('admin.organizations.form.ownerNameLabel')}
				<span class="text-destructive">*</span>
			</label>
			<input
				type="text"
				id="ownerName"
				name="ownerName"
				required
				minlength="2"
				maxlength="255"
				value={(form?.ownerName as string) || ''}
				placeholder={$t('admin.organizations.form.ownerNamePlaceholder')}
				class="rounded-md border border-border px-4 py-2 focus:border-primary focus:ring-2 focus:ring-ring focus:outline-none"
				disabled={isSubmitting}
			/>
		</div>
	{/if}
</form>

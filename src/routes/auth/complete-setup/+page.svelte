<script lang="ts">
	import { enhance } from '$app/forms';
	import { t } from '$lib/i18n';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isSubmitting = $state(false);
</script>

<svelte:head>
	<title>{$t('auth.completeSetup.title')}</title>
</svelte:head>

<div class="flex items-center justify-center bg-muted/50 px-4 py-12 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8">
		<!-- Header -->
		<div class="text-center">
			<h1 class="text-3xl font-bold tracking-tight text-foreground">
				{$t('auth.completeSetup.title')}
			</h1>
			<p class="mt-2 text-lg text-muted-foreground">
				{$t('auth.completeSetup.welcome', { organizationName: data.organizationName } as Record<
					string,
					unknown
				>)}
			</p>
			<p class="mt-2 text-sm text-muted-foreground">
				{$t('auth.completeSetup.instruction')}
			</p>
		</div>

		<!-- Error message -->
		{#if form?.error}
			<div class="rounded-md bg-destructive/10 p-4">
				<p class="text-sm text-destructive">{form.error}</p>
			</div>
		{/if}

		<!-- Form -->
		<form
			method="POST"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					await update();
					isSubmitting = false;
				};
			}}
			class="mt-8 space-y-6"
		>
			<!-- Email (read-only) -->
			<div>
				<label for="email" class="block text-sm font-medium text-foreground/90">
					{$t('auth.login.email')}
				</label>
				<input
					type="email"
					id="email"
					value={data.email}
					disabled
					class="mt-1 block w-full rounded-md border border-border bg-muted px-3 py-2 text-muted-foreground"
				/>
			</div>

			<!-- First Name -->
			<div>
				<label for="firstName" class="block text-sm font-medium text-foreground/90">
					{$t('auth.completeSetup.firstName')}
					<span class="text-destructive">*</span>
				</label>
				<input
					type="text"
					id="firstName"
					name="firstName"
					required
					minlength="2"
					maxlength="255"
					value={(form?.firstName as string) || data.invitation.invitedOwnerName || ''}
					placeholder={$t('auth.completeSetup.firstNamePlaceholder')}
					disabled={isSubmitting}
					class="mt-1 block w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-primary focus:ring-2 focus:ring-ring focus:outline-none"
				/>
			</div>

			<!-- Last Name -->
			<div>
				<label for="lastName" class="block text-sm font-medium text-foreground/90">
					{$t('auth.completeSetup.lastName')}
					<span class="text-destructive">*</span>
				</label>
				<input
					type="text"
					id="lastName"
					name="lastName"
					required
					minlength="2"
					maxlength="255"
					value={(form?.lastName as string) || ''}
					placeholder={$t('auth.completeSetup.lastNamePlaceholder')}
					disabled={isSubmitting}
					class="mt-1 block w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-primary focus:ring-2 focus:ring-ring focus:outline-none"
				/>
			</div>

			<!-- Password -->
			<div>
				<label for="password" class="block text-sm font-medium text-foreground/90">
					{$t('auth.completeSetup.password')}
					<span class="text-destructive">*</span>
				</label>
				<input
					type="password"
					id="password"
					name="password"
					required
					minlength="6"
					placeholder={$t('auth.completeSetup.passwordPlaceholder')}
					disabled={isSubmitting}
					class="mt-1 block w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-primary focus:ring-2 focus:ring-ring focus:outline-none"
				/>
			</div>

			<!-- Confirm Password -->
			<div>
				<label for="confirmPassword" class="block text-sm font-medium text-foreground/90">
					{$t('auth.completeSetup.confirmPassword')}
					<span class="text-destructive">*</span>
				</label>
				<input
					type="password"
					id="confirmPassword"
					name="confirmPassword"
					required
					minlength="6"
					placeholder={$t('auth.completeSetup.confirmPasswordPlaceholder')}
					disabled={isSubmitting}
					class="mt-1 block w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-primary focus:ring-2 focus:ring-ring focus:outline-none"
				/>
			</div>

			<!-- Submit Button -->
			<button
				type="submit"
				disabled={isSubmitting}
				class="w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isSubmitting ? '...' : $t('auth.completeSetup.submit')}
			</button>
		</form>
	</div>
</div>

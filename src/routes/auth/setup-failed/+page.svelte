<script lang="ts">
	import { t } from '$lib/i18n';
	import { Button } from '$lib/components/ui/button';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Map error types to i18n keys
	const errorMessageKey = $derived(() => {
		switch (data.errorType) {
			case 'expired':
				return 'auth.setupFailed.errors.expired';
			case 'invalid':
				return 'auth.setupFailed.errors.invalid';
			case 'completed':
				return 'auth.setupFailed.errors.alreadyCompleted';
			case 'no_invitation':
				return 'auth.setupFailed.errors.noInvitation';
			case 'organization_not_found':
				return 'auth.setupFailed.errors.organizationNotFound';
			default:
				return 'auth.setupFailed.errors.unknown';
		}
	});
</script>

<svelte:head>
	<title>{$t('auth.setupFailed.title')}</title>
</svelte:head>

<div class="flex items-center justify-center bg-muted px-4 py-8">
	<div class="w-full max-w-md space-y-4">
		<!-- Error Icon + Header -->
		<div class="text-center">
			<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
				<svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
			</div>
			<h1 class="mt-3 text-2xl font-bold text-foreground">
				{$t('auth.setupFailed.title')}
			</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				{$t('auth.setupFailed.subtitle')}
			</p>
		</div>

		<!-- Error Message -->
		<div class="rounded-md bg-red-50 p-3">
			<p class="text-sm text-red-800">
				{$t(errorMessageKey())}
			</p>
		</div>

		<!-- Help Text -->
		<div class="rounded-md bg-blue-50 p-3">
			<div class="flex">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<div class="ml-3">
					<h3 class="text-sm font-medium text-blue-800">
						{$t('auth.setupFailed.whatToDo.title')}
					</h3>
					<ul class="mt-1 list-disc space-y-0.5 pl-5 text-sm text-blue-700">
						<li>{$t('auth.setupFailed.whatToDo.contactAdmin')}</li>
						<li>{$t('auth.setupFailed.whatToDo.requestNewInvitation')}</li>
						<li>{$t('auth.setupFailed.whatToDo.checkEmail')}</li>
					</ul>
				</div>
			</div>
		</div>

		<!-- Actions -->
		<div class="space-y-2">
			<Button href="/" variant="default" class="w-full">
				{$t('auth.setupFailed.actions.returnHome')}
			</Button>

			<Button href="/contact" variant="outline" class="w-full">
				{$t('auth.setupFailed.actions.contactSupport')}
			</Button>
		</div>
	</div>
</div>

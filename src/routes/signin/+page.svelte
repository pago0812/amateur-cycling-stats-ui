<script lang="ts">
	import { enhance } from '$app/forms';
	import { Urls } from '$lib/constants/urls';
	import { alertStore } from '$lib/stores/alert-store';
	import { t } from '$lib/i18n';
	import type { ActionData } from './$types';
	import { Button } from '$lib/components/ui/button';

	let { form }: { form: ActionData } = $props();

	// Show error in alert if present
	$effect(() => {
		if (form?.error) {
			alertStore.openAlert(form.error);
		}
	});
</script>

<svelte:head>
	<title>{$t('common.pageTitle.signin')}</title>
</svelte:head>

<section class="py-6 sm:py-8 md:py-10 lg:py-12">
	<div class="flex flex-col items-center">
		<h2 class="mb-8 text-3xl font-bold">{$t('auth.signin.title')}</h2>

		<form method="POST" use:enhance class="flex w-full max-w-md flex-col gap-4">
			<div class="flex flex-col gap-2">
				<label for="name" class="text-sm font-medium text-foreground">
					{$t('auth.signin.name')}
				</label>
				<input
					type="text"
					id="name"
					name="name"
					required
					value={form?.name || ''}
					class="rounded-md border border-border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<div class="flex flex-col gap-2">
				<label for="email" class="text-sm font-medium text-foreground">
					{$t('auth.signin.email')}
				</label>
				<input
					type="email"
					id="email"
					name="email"
					required
					value={form?.email || ''}
					class="rounded-md border border-border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<div class="flex flex-col gap-2">
				<label for="password" class="text-sm font-medium text-foreground">
					{$t('auth.signin.password')}
				</label>
				<input
					type="password"
					id="password"
					name="password"
					required
					class="rounded-md border border-border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<div class="mt-4 flex flex-col items-center gap-4">
				<Button type="submit" variant="default" class="w-full">
					{$t('auth.signin.submit')}
				</Button>

				<a href={Urls.LOGIN} class="text-blue-600 hover:text-blue-800 hover:underline">
					{$t('auth.signin.hasAccount')}
				</a>
			</div>
		</form>
	</div>
</section>

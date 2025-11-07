<script lang="ts">
	import { enhance } from '$app/forms';
	import { Urls } from '$lib/constants/urls';
	import { alertStore } from '$lib/stores/alert-store';
	import { t } from '$lib/i18n';
	import type { ActionData } from './$types';

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

<section class="px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-12 lg:py-12">
	<div class="flex flex-col items-center">
		<h2 class="mb-8 text-3xl font-bold">{$t('auth.signin.title')}</h2>

		<form method="POST" use:enhance class="flex w-full max-w-md flex-col gap-4">
			<div class="flex flex-col gap-2">
				<label for="username" class="text-sm font-medium text-gray-700">
					{$t('auth.signin.username')}
				</label>
				<input
					type="text"
					id="username"
					name="username"
					required
					value={form?.username || ''}
					class="rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<div class="flex flex-col gap-2">
				<label for="email" class="text-sm font-medium text-gray-700">
					{$t('auth.signin.email')}
				</label>
				<input
					type="email"
					id="email"
					name="email"
					required
					value={form?.email || ''}
					class="rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<div class="flex flex-col gap-2">
				<label for="password" class="text-sm font-medium text-gray-700">
					{$t('auth.signin.password')}
				</label>
				<input
					type="password"
					id="password"
					name="password"
					required
					class="rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<div class="mt-4 flex flex-col items-center gap-4">
				<button
					type="submit"
					class="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
				>
					{$t('auth.signin.submit')}
				</button>

				<a href={Urls.LOGIN} class="text-blue-600 hover:text-blue-800 hover:underline">
					{$t('auth.signin.hasAccount')}
				</a>
			</div>
		</form>
	</div>
</section>

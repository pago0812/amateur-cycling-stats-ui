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
	<title>{$t('common.pageTitle.login')}</title>
</svelte:head>

<section class="px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10 lg:py-12">
	<div class="flex flex-col items-center">
		<h2 class="text-3xl font-bold mb-8">{$t('auth.login.title')}</h2>

		<form
			method="POST"
			use:enhance
			class="w-full max-w-md flex flex-col gap-4"
		>
			<div class="flex flex-col gap-2">
				<label for="email" class="text-sm font-medium text-gray-700">
					{$t('auth.login.email')}
				</label>
				<input
					type="email"
					id="email"
					name="email"
					required
					value={form?.email || ''}
					class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>

			<div class="flex flex-col gap-2">
				<label for="password" class="text-sm font-medium text-gray-700">
					{$t('auth.login.password')}
				</label>
				<input
					type="password"
					id="password"
					name="password"
					required
					class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>

			<div class="flex flex-col gap-4 items-center mt-4">
				<button
					type="submit"
					class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
				>
					{$t('auth.login.submit')}
				</button>

				<a
					href={Urls.SIGNIN}
					class="text-blue-600 hover:text-blue-800 hover:underline"
				>
					{$t('auth.login.noAccount')}
				</a>
			</div>
		</form>
	</div>
</section>

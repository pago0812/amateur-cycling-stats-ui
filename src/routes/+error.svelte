<script lang="ts">
	import { page } from '$app/stores';
	import { t } from '$lib/i18n';
</script>

<svelte:head>
	<title>{$page.status} - {$t('common.general.error')} - ACS</title>
</svelte:head>

<section class="px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-12 lg:py-12">
	<div class="mx-auto max-w-2xl">
		<div class="rounded-lg border border-gray-200 bg-gray-50 px-8 py-12 text-center">
			<!-- Error Status Code -->
			<h1 class="mb-4 text-6xl font-bold text-gray-800">
				{$page.status}
			</h1>

			<!-- Error Message -->
			<p class="mb-6 text-xl text-gray-600">
				{$page.error?.message || $t('common.general.error')}
			</p>

			<!-- Helpful Suggestion -->
			{#if $page.status === 404}
				<p class="text-sm text-gray-500">
					{$t('common.errors.notFoundSuggestion')}
				</p>
			{:else if $page.status >= 500}
				<p class="text-sm text-gray-500">
					{$t('common.errors.serverErrorSuggestion')}
				</p>
			{/if}
		</div>
	</div>
</section>

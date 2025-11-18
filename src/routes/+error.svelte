<script lang="ts">
	import { page } from '$app/stores';
	import { t } from '$lib/i18n';
</script>

<svelte:head>
	<title>{$page.status} - {$t('common.general.error')} - ACS</title>
</svelte:head>

<section class="py-6 sm:py-8 md:py-10 lg:py-12">
	<div>
		<div class="rounded-lg border border-border bg-muted/50 px-8 py-12 text-center">
			<!-- Error Status Code -->
			<h1 class="mb-4 text-6xl font-bold text-foreground">
				{$page.status}
			</h1>

			<!-- Error Message -->
			<p class="mb-6 text-xl text-muted-foreground">
				{$page.error?.message || $t('common.general.error')}
			</p>

			<!-- Helpful Suggestion -->
			{#if $page.status === 404}
				<p class="text-sm text-muted-foreground">
					{$t('common.errors.notFoundSuggestion')}
				</p>
			{:else if $page.status >= 500}
				<p class="text-sm text-muted-foreground">
					{$t('common.errors.serverErrorSuggestion')}
				</p>
			{/if}
		</div>
	</div>
</section>

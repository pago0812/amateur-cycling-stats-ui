<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import GlobalAlert from '$lib/components/GlobalAlert.svelte';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';
	import { locale, loadTranslations } from '$lib/i18n';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	// Initialize locale on client side to match server
	$effect(() => {
		if (data.locale && $locale !== data.locale) {
			locale.set(data.locale);
			loadTranslations(data.locale);
		}
	});
</script>

<svelte:head>
	<meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1" />
</svelte:head>

<div class="min-h-screen bg-white">
	<Header user={data.user} />
	<GlobalAlert />
	<main>
		{@render children()}
	</main>
</div>

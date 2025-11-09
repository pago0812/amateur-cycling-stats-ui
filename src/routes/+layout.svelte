<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import GlobalAlert from '$lib/components/GlobalAlert.svelte';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<svelte:head>
	<meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1" />
</svelte:head>

<div class="min-h-screen bg-white">
	<Header user={data.user} />
	<GlobalAlert />
	<main class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		{@render children()}
	</main>
</div>

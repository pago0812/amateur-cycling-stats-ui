<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import GlobalAlert from '$lib/components/GlobalAlert.svelte';
	import type { LayoutData } from './$types';

	let { data }: { data: LayoutData } = $props();
</script>

<svelte:head>
	<meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1" />
</svelte:head>

<div class="min-h-screen bg-white">
	<Header user={data.user} />
	<GlobalAlert />
	<main>
		<slot />
	</main>
</div>

<script lang="ts">
	import '../app.css';
	import { Header } from '$lib/components';
	import { Toaster } from 'svelte-sonner';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<svelte:head>
	<meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1" />
</svelte:head>

<div class="min-h-screen bg-white">
	<Header user={data.user} />
	<Toaster position="top-center" closeButton duration={5000} richColors />
	<main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
		{@render children()}
	</main>
</div>

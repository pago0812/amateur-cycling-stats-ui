<script lang="ts">
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { children }: { data: LayoutData; children: Snippet } = $props();
</script>

<!-- Page Content -->
{@render children()}

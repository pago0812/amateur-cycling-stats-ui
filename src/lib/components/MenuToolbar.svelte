<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/Button.svelte';

	interface Tab {
		path: string;
		label: string;
	}

	interface Breadcrumb {
		label: string;
		href?: string; // undefined for current page (last item)
	}

	interface ActionButton {
		label: string;
		onClick: () => void;
		variant?: 'primary' | 'secondary' | 'danger';
		href?: string;
	}

	let {
		breadcrumbs,
		tabs,
		actions
	}: {
		breadcrumbs: Breadcrumb[];
		tabs?: Tab[];
		actions?: ActionButton[];
	} = $props();

	// Find the longest matching tab path (most specific match)
	const activeTabPath = $derived.by(() => {
		if (!tabs || tabs.length === 0) return undefined;
		const matchingTabs = tabs.filter(
			(tab) => $page.url.pathname === tab.path || $page.url.pathname.startsWith(tab.path + '/')
		);
		// Sort by path length descending, return the longest match
		return matchingTabs.sort((a, b) => b.path.length - a.path.length)[0]?.path;
	});

	// Helper to check if tab is active
	const isActive = (tabPath: string) => {
		return activeTabPath === tabPath;
	};
</script>

<!-- Menu Navigation Toolbar -->
<nav class="bg-gray-50 p-4">
	<div class="flex h-full flex-col gap-2">
		<!-- Row 1: Breadcrumbs + Action Button -->
		<div class="flex h-9 items-center gap-4">
			<!-- Breadcrumb navigation -->
			<nav class="flex shrink-0 items-center gap-2">
				{#each breadcrumbs as breadcrumb, index}
					{#if index > 0}
						<span class="text-gray-400">/</span>
					{/if}
					{#if breadcrumb.href}
						<!-- Clickable breadcrumb (not current page) -->
						<a
							href={breadcrumb.href}
							class="px-1 text-base leading-none text-gray-500 transition-colors hover:text-gray-800 hover:underline"
						>
							{breadcrumb.label}
						</a>
					{:else}
						<!-- Current page (last breadcrumb) -->
						<span class="px-1 text-base leading-none text-gray-800">
							{breadcrumb.label}
						</span>
					{/if}
				{/each}
			</nav>
		</div>

		<!-- Row 2: Navigation Tabs -->
		<div class="flex h-9 items-end gap-8">
			{#if tabs && tabs.length > 0}
				<ul class="flex gap-8 overflow-x-auto">
					{#each tabs as tab}
						<li class="shrink-0">
							<a
								href={tab.path}
								class="inline-block border-b px-1 pb-2 text-base leading-none whitespace-nowrap transition-colors {isActive(
									tab.path
								)
									? 'border-gray-800  text-gray-800'
									: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800'}"
							>
								{tab.label}
							</a>
						</li>
					{/each}
				</ul>
			{/if}
			<!-- Action Buttons (right-aligned) -->
			{#if actions && actions.length > 0}
				<div class="ml-auto flex shrink-0 gap-2">
					{#each actions as actionItem}
						<Button
							variant="outlined"
							color={actionItem.variant ?? 'primary'}
							size="sm"
							href={actionItem.href}
							onclick={actionItem.href ? undefined : actionItem.onClick}
						>
							{actionItem.label}
						</Button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</nav>

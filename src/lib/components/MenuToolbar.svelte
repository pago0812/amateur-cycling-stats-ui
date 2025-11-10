<script lang="ts">
	import { page } from '$app/stores';

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
	}

	let {
		breadcrumbs,
		tabs,
		action,
		level = 'primary'
	}: {
		breadcrumbs: Breadcrumb[];
		tabs?: Tab[];
		action?: ActionButton;
		level?: 'primary' | 'secondary';
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

	// Get button classes based on variant
	const getActionButtonClass = (variant?: string) => {
		const baseClass = 'text-base leading-none font-medium transition-colors';
		switch (variant) {
			case 'danger':
				return `${baseClass} text-gray-800 hover:text-red-600`;
			case 'secondary':
				return `${baseClass} text-gray-500 hover:text-gray-800`;
			default: // 'primary'
				return `${baseClass} text-gray-800 hover:text-gray-600`;
		}
	};
</script>

<!-- Menu Navigation Toolbar -->
<nav class="bg-gray-50 {level === 'secondary' ? 'px-4 pb-4' : 'p-4'}">
	<div class="flex h-full flex-col gap-2">
		<!-- Row 1: Breadcrumbs + Action Button -->
		<div class="flex items-center justify-between gap-4">
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
							class="px-1 {level === 'primary' ? 'text-lg' : 'text-base'} leading-none text-gray-500 transition-colors hover:text-gray-800 hover:underline"
						>
							{breadcrumb.label}
						</a>
					{:else}
						<!-- Current page (last breadcrumb) -->
						<span class="px-1 {level === 'primary' ? 'text-lg' : 'text-base'} leading-none text-gray-800">
							{breadcrumb.label}
						</span>
					{/if}
				{/each}
			</nav>

			<!-- Action Button (right-aligned) -->
			{#if action}
				<div class="shrink-0">
					<button
						type="button"
						class={getActionButtonClass(action.variant)}
						onclick={action.onClick}
					>
						{action.label}
					</button>
				</div>
			{/if}
		</div>

		<!-- Row 2: Navigation Tabs -->
		{#if tabs && tabs.length > 0}
			<div class="flex items-end">
				<ul class="flex gap-8 overflow-x-auto">
					{#each tabs as tab}
						<li class="shrink-0">
							<a
								href={tab.path}
								class="inline-block border-b-2 px-1 pb-2 text-base leading-none whitespace-nowrap transition-colors {isActive(
									tab.path
								)
									? 'border-gray-800 font-bold text-gray-800'
									: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800'}"
							>
								{tab.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</nav>

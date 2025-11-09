<script lang="ts">
	import { page } from '$app/stores';
	import { t } from '$lib/i18n';

	interface Tab {
		path: string;
		label: string;
	}

	let { tabs, showLogout = false }: { tabs: Tab[]; showLogout?: boolean } = $props();

	// Find the longest matching tab path (most specific match)
	const activeTabPath = $derived.by(() => {
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

<!-- Secondary Navigation Toolbar -->
<nav class="mb-6 h-9 border-b border-gray-200">
	<div class="flex items-end justify-between gap-4">
		<!-- Navigation tabs -->
		<ul class="flex gap-8 overflow-x-auto">
			{#each tabs as tab}
				<li class="shrink-0">
					<a
						href={tab.path}
						class="inline-block border-b-2 px-1 pb-3 text-base leading-none whitespace-nowrap transition-colors {isActive(
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

		<!-- Logout button (right-aligned) -->
		{#if showLogout}
			<div class="shrink-0 pb-3">
				<form method="POST" action="?/logout">
					<button
						type="submit"
						class="text-base leading-none font-medium text-gray-800 transition-colors hover:text-red-600"
					>
						{$t('common.navigation.logout')}
					</button>
				</form>
			</div>
		{/if}
	</div>
</nav>

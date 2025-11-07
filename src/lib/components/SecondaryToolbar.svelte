<script lang="ts">
	import { page } from '$app/stores';
	import { t } from '$lib/i18n';

	interface Tab {
		path: string;
		label: string;
	}

	let { tabs, showLogout = false }: { tabs: Tab[]; showLogout?: boolean } = $props();

	// Helper to check if tab is active
	const isActive = (tabPath: string) => {
		return $page.url.pathname === tabPath;
	};
</script>

<!-- Secondary Navigation Toolbar -->
<nav class="mb-8 border-b border-gray-200">
	<div class="flex items-center justify-between">
		<!-- Navigation tabs -->
		<ul class="flex gap-8 overflow-x-auto">
			{#each tabs as tab}
				<li class="shrink-0">
					<a
						href={tab.path}
						class="inline-block border-b-2 px-2 pb-4 whitespace-nowrap transition-colors {isActive(
							tab.path
						)
							? 'border-blue-600 font-semibold text-blue-600'
							: 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'}"
					>
						{tab.label}
					</a>
				</li>
			{/each}
		</ul>

		<!-- Logout button (right-aligned) -->
		{#if showLogout}
			<form method="POST" action="?/logout" class="shrink-0">
				<button
					type="submit"
					class="px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-red-600"
				>
					{$t('common.navigation.logout')}
				</button>
			</form>
		{/if}
	</div>
</nav>

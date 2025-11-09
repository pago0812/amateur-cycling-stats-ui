<script lang="ts">
	import { page } from '$app/stores';
	import { t } from '$lib/i18n';
	import type { Snippet } from 'svelte';

	interface Tab {
		path: string;
		label: string;
	}

	interface Breadcrumb {
		label: string;
		href?: string; // undefined for current page (last item)
	}

	let {
		breadcrumbs,
		tabs,
		showLogout = false,
		actions
	}: {
		breadcrumbs: Breadcrumb[];
		tabs?: Tab[];
		showLogout?: boolean;
		actions?: Snippet;
	} = $props();

	// Helper to check if tab is active
	const isActive = (tabPath: string) => {
		return $page.url.pathname === tabPath;
	};
</script>

<!-- Tertiary Navigation Toolbar -->
<nav class="mb-6 h-9 border-b border-gray-200">
	<div class="flex items-end justify-between gap-4">
		<!-- Left side: breadcrumbs + tabs -->
		<div class="flex min-w-0 flex-1 items-center gap-6 overflow-x-auto pb-0">
			<!-- Breadcrumb navigation -->
			<nav class="flex shrink-0 items-center gap-2 pb-2">
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

			<!-- Navigation tabs (optional) -->
			{#if tabs && tabs.length > 0}
				<ul class="flex gap-8">
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
			{/if}
		</div>

		<!-- Right side: custom actions or logout button -->
		{#if actions || showLogout}
			<div class="shrink-0 pb-3">
				{#if actions}
					{@render actions()}
				{:else if showLogout}
					<form method="POST" action="?/logout">
						<button
							type="submit"
							class="text-base leading-none font-medium text-gray-800 transition-colors hover:text-red-600"
						>
							{$t('common.navigation.logout')}
						</button>
					</form>
				{/if}
			</div>
		{/if}
	</div>
</nav>

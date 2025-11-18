<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';

	interface Tab {
		path: string;
		label: string;
	}

	interface BreadcrumbItem {
		label: string;
		href?: string; // undefined for current page (last item)
	}

	interface ActionButton {
		label: string;
		onClick: () => void;
		variant?: 'default' | 'secondary' | 'destructive';
		href?: string;
	}

	let {
		breadcrumbs,
		tabs,
		actions
	}: {
		breadcrumbs: BreadcrumbItem[];
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
<nav class="bg-muted/50 p-4">
	<div class="flex h-full flex-col gap-2">
		<!-- Row 1: Breadcrumbs + Action Button -->
		<div class="flex h-9 items-center gap-4">
			<!-- Breadcrumb navigation using shadcn-svelte -->
			<Breadcrumb.Root class="shrink-0">
				<Breadcrumb.List>
					{#each breadcrumbs as breadcrumb, index}
						{#if index > 0}
							<Breadcrumb.Separator>
								<span class="text-muted-foreground">/</span>
							</Breadcrumb.Separator>
						{/if}
						<Breadcrumb.Item>
							{#if breadcrumb.href}
								<!-- Clickable breadcrumb (not current page) -->
								<Breadcrumb.Link
									href={breadcrumb.href}
									class="px-1 text-base leading-none text-muted-foreground transition-colors hover:text-foreground hover:underline"
								>
									{breadcrumb.label}
								</Breadcrumb.Link>
							{:else}
								<!-- Current page (last breadcrumb) -->
								<Breadcrumb.Page class="px-1 text-base leading-none text-foreground">
									{breadcrumb.label}
								</Breadcrumb.Page>
							{/if}
						</Breadcrumb.Item>
					{/each}
				</Breadcrumb.List>
			</Breadcrumb.Root>
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
									? 'border-foreground text-foreground'
									: 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'}"
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
							variant={actionItem.variant ?? 'outline'}
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

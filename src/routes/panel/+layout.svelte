<script lang="ts">
	import { page } from '$app/stores';
	import { t } from '$lib/i18n';
	import { RoleTypeEnum } from '$lib/types/domain';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	// Define navigation tabs based on user role
	const baseTabs = [
		{ path: '/panel/organization', label: $t('panel.tabs.manageOrganization') },
		{ path: '/panel/events', label: $t('panel.tabs.manageEvents') },
		{ path: '/panel/organizers', label: $t('panel.tabs.manageOrganizers') }
	];

	const adminTab = {
		path: '/panel/organizations',
		label: $t('panel.tabs.manageOrganizations')
	};

	// Add admin-only tab if user is admin
	const tabs = $derived(
		data.user?.role?.name === RoleTypeEnum.ADMIN ? [...baseTabs, adminTab] : baseTabs
	);

	// Helper to check if tab is active
	const isActive = (tabPath: string) => {
		return $page.url.pathname === tabPath;
	};
</script>

<div class="px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10 lg:py-12">
	<!-- Page Header -->
	<div class="mb-8">
		<h1 class="text-4xl font-bold mb-2">{$t('panel.title')}</h1>
		<p class="text-gray-600">{$t('panel.subtitle')}</p>
	</div>

	<!-- Secondary Navigation Toolbar -->
	<nav class="mb-8 border-b border-gray-200">
		<ul class="flex gap-8 overflow-x-auto">
			{#each tabs as tab}
				<li class="flex-shrink-0">
					<a
						href={tab.path}
						class="inline-block pb-4 px-2 border-b-2 transition-colors whitespace-nowrap {isActive(
							tab.path
						)
							? 'border-blue-600 text-blue-600 font-semibold'
							: 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'}"
					>
						{tab.label}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- Page Content -->
	<div>
		{@render children()}
	</div>
</div>

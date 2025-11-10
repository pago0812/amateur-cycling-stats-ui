<script lang="ts">
	import { t } from '$lib/i18n';
	import MenuToolbar from '$lib/components/MenuToolbar.svelte';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	// Logout form reference
	let logoutForm: HTMLFormElement;

	// Define navigation tabs for panel
	const tabs = [
		{ path: '/panel', label: $t('panel.tabs.summary') },
		{ path: '/panel/organization', label: $t('panel.tabs.organization') }
	];

	// Logout action handler
	const handleLogout = () => {
		logoutForm.requestSubmit();
	};
</script>

<!-- Hidden logout form -->
<form method="POST" action="?/logout" bind:this={logoutForm} class="hidden"></form>

<!-- Menu Navigation Toolbar -->
<MenuToolbar
	breadcrumbs={[{ label: $t('panel.title') }]}
	{tabs}
	action={{ label: $t('common.navigation.logout'), onClick: handleLogout }}
	level="primary"
/>

<!-- Page Content -->
<div>
	{@render children()}
</div>

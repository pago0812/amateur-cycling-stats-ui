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
		{ path: '/panel', label: $t('panel.tabs.overview') },
		{ path: '/panel/members', label: $t('panel.tabs.members') }
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
	action={{ label: $t('common.navigation.logout'), onClick: handleLogout, variant: 'danger' }}
	level="primary"
/>

<!-- Page Content -->
<div>
	{@render children()}
</div>

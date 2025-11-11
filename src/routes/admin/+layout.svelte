<script lang="ts">
	import { t } from '$lib/i18n';
	import MenuToolbar from '$lib/components/MenuToolbar.svelte';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { children }: { data: LayoutData; children: Snippet } = $props();

	// Logout form reference
	let logoutForm: HTMLFormElement;

	// Define navigation tabs for admin
	const tabs = [
		{ path: '/admin', label: $t('admin.tabs.summary') },
		{ path: '/admin/organizations', label: $t('admin.tabs.organizations') }
	];

	// Logout action handler
	const handleLogout = () => {
		logoutForm.requestSubmit();
	};
</script>

<!-- Hidden logout form -->
<form method="POST" action="/admin?/logout" bind:this={logoutForm} class="hidden"></form>

<!-- Menu Navigation Toolbar -->
<MenuToolbar
	breadcrumbs={[{ label: $t('admin.title') }]}
	{tabs}
	actions={[{ label: $t('common.navigation.logout'), onClick: handleLogout, variant: 'secondary' }]}
	level="primary"
/>

<!-- Page Content -->
<div>
	{@render children()}
</div>

<script lang="ts">
	import { t } from '$lib/i18n';
	import MenuToolbar from '$lib/components/MenuToolbar.svelte';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	// Logout form reference
	let logoutForm: HTMLFormElement;

	// Define navigation tabs for cyclist account
	const tabs = [
		{ path: '/account', label: $t('account.tabs.profile') },
		{ path: '/account/events', label: $t('account.tabs.upcomingEvents') }
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
	breadcrumbs={[{ label: $t('account.title') }]}
	{tabs}
	action={{ label: $t('common.navigation.logout'), onClick: handleLogout }}
	level="primary"
/>

<!-- Page Content -->
<div>
	{@render children()}
</div>

<script lang="ts">
	import CyclistProfile from '$lib/components/CyclistProfile.svelte';
	import MenuToolbar from '$lib/components/MenuToolbar.svelte';
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Define navigation tabs for account section
	const tabs = [
		{ path: '/account', label: $t('account.tabs.profile') },
		{ path: '/account/events', label: $t('account.tabs.upcomingEvents') }
	];
</script>

<svelte:head>
	<title>{$t('account.tabs.profile')} - ACS</title>
</svelte:head>

<!-- Menu Toolbar with breadcrumb and tabs -->
<MenuToolbar breadcrumbs={[{ label: $t('account.title') }]} {tabs} />

<div class="mt-8">
	<CyclistProfile cyclist={data.cyclist} raceResults={data.raceResults} />
</div>

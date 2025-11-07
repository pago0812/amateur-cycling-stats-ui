<script lang="ts">
	import CyclistProfile from '$lib/components/CyclistProfile.svelte';
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{$t('account.tabs.profile')} - ACS</title>
</svelte:head>

<CyclistProfile cyclist={data.cyclist} />

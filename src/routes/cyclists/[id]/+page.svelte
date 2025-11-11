<script lang="ts">
	import CyclistProfile from '$lib/components/CyclistProfile.svelte';
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title
		>{data.cyclist.user?.firstName}
		{data.cyclist.user?.lastName || ''} - {$t('common.navigation.cyclists')} - ACS</title
	>
</svelte:head>

<section class="py-6 sm:py-8 md:py-10 lg:py-12">
	<CyclistProfile cyclist={data.cyclist} />
</section>

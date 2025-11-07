<script lang="ts">
	import CyclistProfile from '$lib/components/CyclistProfile.svelte';
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title
		>{data.cyclist.name} {data.cyclist.lastName} - {$t('common.navigation.cyclists')} - ACS</title
	>
</svelte:head>

<section class="px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-12 lg:py-12">
	<CyclistProfile cyclist={data.cyclist} />
</section>

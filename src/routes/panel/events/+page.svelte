<script lang="ts">
	import { t } from '$lib/i18n';
	import MenuToolbar from '$lib/components/MenuToolbar.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{$t('panel.tabs.manageEvents')} - ACS</title>
</svelte:head>

<!-- Subsection toolbar with page title -->
<MenuToolbar breadcrumbs={[{ label: $t('panel.events.title') }]} level="secondary" />

<div class="mt-8">
	<div class="rounded-lg bg-gray-50 p-8 text-center">
		<p class="mb-2 text-lg text-gray-600">{$t('panel.events.comingSoon')}</p>
		<p class="text-sm text-gray-500">
			{$t('panel.events.description')}
		</p>
	</div>
</div>

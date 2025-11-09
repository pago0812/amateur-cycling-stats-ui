<script lang="ts">
	import { t } from '$lib/i18n';
	import TertiaryToolbar from '$lib/components/TertiaryToolbar.svelte';
</script>

<svelte:head>
	<title>{$t('admin.generalConfig.title')} - Amateur Cycling Stats</title>
</svelte:head>

<!-- Tertiary Toolbar with breadcrumb -->
<TertiaryToolbar breadcrumbs={[{ label: $t('admin.breadcrumbs.generalConfig') }]} />

<div class="rounded-lg bg-gray-50 py-12 text-center">
	<p class="mb-2 text-xl font-semibold text-gray-700">
		{$t('admin.generalConfig.comingSoon')}
	</p>
	<p class="text-gray-600">
		{$t('admin.generalConfig.description')}
	</p>
</div>

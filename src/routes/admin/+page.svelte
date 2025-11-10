<script lang="ts">
	import { t } from '$lib/i18n';
	import MenuToolbar from '$lib/components/MenuToolbar.svelte';
</script>

<svelte:head>
	<title>{$t('admin.generalConfig.title')} - Amateur Cycling Stats</title>
</svelte:head>

<!-- Menu Toolbar with breadcrumb (subsection navigation) -->
<MenuToolbar breadcrumbs={[{ label: $t('admin.breadcrumbs.generalConfig') }]} level="secondary" />

<div class="mt-8">
	<div class="rounded-lg bg-gray-50 py-12 text-center">
		<p class="mb-2 text-xl font-semibold text-gray-700">
			{$t('admin.generalConfig.comingSoon')}
		</p>
		<p class="text-gray-600">
			{$t('admin.generalConfig.description')}
		</p>
	</div>
</div>

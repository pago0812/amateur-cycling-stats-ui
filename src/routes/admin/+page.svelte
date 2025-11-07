<script lang="ts">
	import { t } from '$lib/i18n';
</script>

<svelte:head>
	<title>{$t('admin.generalConfig.title')} - Amateur Cycling Stats</title>
</svelte:head>

<div class="rounded-lg bg-white p-8 shadow-sm">
	<h2 class="mb-4 text-2xl font-semibold">{$t('admin.generalConfig.title')}</h2>
	<div class="rounded-lg bg-gray-50 py-12 text-center">
		<p class="mb-2 text-xl font-semibold text-gray-700">
			{$t('admin.generalConfig.comingSoon')}
		</p>
		<p class="text-gray-600">
			{$t('admin.generalConfig.description')}
		</p>
	</div>
</div>

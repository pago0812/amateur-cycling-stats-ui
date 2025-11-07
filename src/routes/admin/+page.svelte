<script lang="ts">
	import { t } from '$lib/i18n';
</script>

<svelte:head>
	<title>{$t('admin.generalConfig.title')} - Amateur Cycling Stats</title>
</svelte:head>

<div class="bg-white rounded-lg shadow-sm p-8">
	<h2 class="text-2xl font-semibold mb-4">{$t('admin.generalConfig.title')}</h2>
	<div class="text-center py-12 bg-gray-50 rounded-lg">
		<p class="text-xl font-semibold text-gray-700 mb-2">
			{$t('admin.generalConfig.comingSoon')}
		</p>
		<p class="text-gray-600">
			{$t('admin.generalConfig.description')}
		</p>
	</div>
</div>

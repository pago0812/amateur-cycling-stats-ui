<script lang="ts">
	import { t } from '$lib/i18n';
	import MenuToolbar from '$lib/components/MenuToolbar.svelte';
</script>

<svelte:head>
	<title>{$t('panel.tabs.manageOrganizers')} - ACS</title>
</svelte:head>

<!-- Menu Toolbar with full breadcrumb path -->
<MenuToolbar
	breadcrumbs={[
		{ label: $t('panel.title'), href: '/panel' },
		{ label: $t('panel.organizers.title') }
	]}
/>

<div class="mt-8">
	<div class="rounded-lg bg-gray-50 p-8 text-center">
		<p class="mb-2 text-lg text-gray-600">{$t('panel.organizers.comingSoon')}</p>
		<p class="text-sm text-gray-500">
			{$t('panel.organizers.description')}
		</p>
	</div>
</div>

<script lang="ts">
	import { t } from '$lib/i18n';
	import { MenuToolbar } from '$lib/components';

	const breadcrumbs = [{ label: $t('admin.title') }];

	const tabs = [
		{ path: '/admin', label: $t('admin.tabs.summary') },
		{ path: '/admin/organizations', label: $t('admin.tabs.organizations') }
	];
</script>

<svelte:head>
	<title>{$t('admin.generalConfig.title')} - Amateur Cycling Stats</title>
</svelte:head>

<MenuToolbar {breadcrumbs} {tabs} />

<div class="mt-8">
	<div class="rounded-lg bg-muted/50 py-12 text-center">
		<p class="mb-2 text-xl font-semibold text-foreground">
			{$t('admin.generalConfig.comingSoon')}
		</p>
		<p class="text-muted-foreground">
			{$t('admin.generalConfig.description')}
		</p>
	</div>
</div>

<script lang="ts">
	import { t } from '$lib/i18n';
	import { MenuToolbar } from '$lib/components';

	// Define navigation tabs for panel section
	const tabs = [
		{ path: '/panel', label: $t('panel.tabs.summary') },
		{ path: '/panel/organization', label: $t('panel.tabs.organization') },
		{ path: '/panel/events', label: $t('panel.tabs.events') }
	];
</script>

<svelte:head>
	<title>{$t('panel.tabs.summary')} - ACS</title>
</svelte:head>

<!-- Menu Toolbar with breadcrumb and tabs -->
<MenuToolbar breadcrumbs={[{ label: $t('panel.title') }]} {tabs} />

<!-- Summary/Dashboard placeholder -->
<div class="mt-8 rounded-lg bg-muted/50 p-8 text-center">
	<h2 class="mb-4 text-2xl font-bold">{$t('panel.summary.title')}</h2>
	<p class="mb-2 text-lg text-muted-foreground">{$t('panel.summary.comingSoon')}</p>
	<p class="text-sm text-muted-foreground">
		{$t('panel.summary.description')}
	</p>
</div>

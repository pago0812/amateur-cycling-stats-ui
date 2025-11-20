<script lang="ts">
	import { t } from '$lib/i18n';
	import { MenuToolbar } from '$lib/components';
</script>

<svelte:head>
	<title>{$t('account.tabs.upcomingEvents')} - ACS</title>
</svelte:head>

<!-- Menu Toolbar with full breadcrumb path -->
<MenuToolbar
	breadcrumbs={[
		{ label: $t('account.title'), href: '/account' },
		{ label: $t('account.tabs.upcomingEvents') }
	]}
/>

<div class="mt-8">
	<div class="rounded-lg bg-muted/50 p-8 text-center">
		<p class="mb-2 text-lg text-muted-foreground">{$t('account.upcomingEvents.comingSoon')}</p>
		<p class="text-sm text-muted-foreground">
			{$t('account.upcomingEvents.description')}
		</p>
	</div>
</div>

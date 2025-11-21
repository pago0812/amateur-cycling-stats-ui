<script lang="ts">
	import type { PageData } from './$types';
	import { t } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { MenuToolbar } from '$lib/components';
	import EventProfile from '$lib/components/custom/EventProfile/EventProfile.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';

	let { data }: { data: PageData } = $props();
	let showDeleteDialog = $state(false);
	let isDeleting = $state(false);

	const canDelete = data.event.eventStatus === 'DRAFT';
</script>

<svelte:head>
	<title>{data.event.name} - ACS</title>
</svelte:head>

<MenuToolbar
	breadcrumbs={[
		{ label: $t('panel.title'), href: '/panel' },
		{ label: $t('panel.events.title'), href: '/panel/events' },
		{ label: data.event.name }
	]}
	actions={[
		{
			label: $t('panel.events.editButton'),
			href: `/panel/events/${data.event.id}/edit`,
			onClick: () => goto(`/panel/events/${data.event.id}/edit`),
			variant: 'default'
		},
		{
			label: $t('panel.events.deleteButton'),
			onClick: () => {
				showDeleteDialog = true;
			},
			variant: 'destructive'
		}
	]}
/>

<div class="mt-8 space-y-6">
	<!-- Visibility toggle -->
	<form method="POST" action="?/toggleVisibility" use:enhance>
		<Button type="submit" variant="outline" size="sm">
			{data.event.isPublicVisible
				? $t('panel.events.visibility.hidden')
				: $t('panel.events.visibility.visible')}
			- {$t('panel.events.visibility.toggleLabel')}
		</Button>
	</form>

	<!-- Event profile -->
	<EventProfile event={data.event} />
</div>

<!-- Delete confirmation dialog -->
<AlertDialog.Root bind:open={showDeleteDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{$t('panel.events.delete.title')}</AlertDialog.Title>
			<AlertDialog.Description>
				{#if canDelete}
					{$t('panel.events.delete.description')}
				{:else}
					{$t('panel.events.delete.onlyDraft')}
				{/if}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{$t('panel.events.delete.cancel')}</AlertDialog.Cancel>
			{#if canDelete}
				<form
					method="POST"
					action="?/delete"
					use:enhance={() => {
						isDeleting = true;
						return async ({ update }) => {
							await update();
							isDeleting = false;
						};
					}}
				>
					<Button type="submit" variant="destructive" disabled={isDeleting}>
						{$t('panel.events.delete.confirm')}
					</Button>
				</form>
			{/if}
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

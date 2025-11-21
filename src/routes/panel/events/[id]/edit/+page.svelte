<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { t } from '$lib/i18n';
	import { MenuToolbar } from '$lib/components';
	import EventForm from '$lib/components/custom/EventForm/EventForm.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let formElement: HTMLFormElement;

	const breadcrumbs = [
		{ label: data.organization.name, href: '/panel' },
		{ label: $t('panel.events.title'), href: '/panel/events' },
		{ label: data.event.name, href: `/panel/events/${data.event.id}` },
		{ label: $t('panel.breadcrumbs.editEvent') }
	];

	const actions = [
		{
			label: $t('panel.events.saveButton'),
			onClick: () => formElement?.requestSubmit(),
			variant: 'default' as const
		}
	];
</script>

<svelte:head>
	<title>{$t('panel.breadcrumbs.editEvent')} - {data.event.name} - ACS</title>
</svelte:head>

<MenuToolbar {breadcrumbs} {actions} />

<div class="mt-8">
	<EventForm
		mode="edit"
		event={data.event}
		categories={[]}
		genders={[]}
		lengths={[]}
		bind:formElement
		error={form?.error}
	/>
</div>

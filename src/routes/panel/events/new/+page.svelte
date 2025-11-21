<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { t } from '$lib/i18n';
	import { MenuToolbar } from '$lib/components';
	import EventForm from '$lib/components/custom/EventForm/EventForm.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let formElement: HTMLFormElement;
</script>

<svelte:head>
	<title>{$t('panel.breadcrumbs.newEvent')} - ACS</title>
</svelte:head>

<MenuToolbar
	breadcrumbs={[
		{ label: $t('panel.title'), href: '/panel' },
		{ label: $t('panel.events.title'), href: '/panel/events' },
		{ label: $t('panel.breadcrumbs.newEvent') }
	]}
	actions={[
		{
			label: $t('panel.events.createButton'),
			onClick: () => formElement?.requestSubmit(),
			variant: 'default'
		}
	]}
/>

<div class="mt-8">
	<EventForm
		mode="create"
		categories={data.categories}
		genders={data.genders}
		lengths={data.lengths}
		bind:formElement
		error={form?.error}
	/>
</div>

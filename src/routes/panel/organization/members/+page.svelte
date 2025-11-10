<script lang="ts">
	import MembersTable from '$lib/components/MembersTable.svelte';
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{$t('panel.organization.tabs.members')} - ACS</title>
</svelte:head>

<div class="mt-8">
	<!-- Error message if organizers failed to load -->
	{#if data.error}
		<div class="mb-6 rounded-md border border-red-300 bg-red-50 p-4">
			<p class="text-sm text-red-800">
				{$t('common.members.errors.loadFailed')}: {data.error}
			</p>
		</div>
	{/if}

	<!-- Members table -->
	<MembersTable organizers={data.organizers} />
</div>

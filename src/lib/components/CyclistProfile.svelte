<script lang="ts">
	import CyclistResultsTable from '$lib/components/CyclistResultsTable.svelte';
	import { t } from '$lib/i18n';
	import type { CyclistWithRelations } from '$lib/types/domain';

	let { cyclist }: { cyclist: CyclistWithRelations } = $props();
</script>

<div class="space-y-8">
	<!-- Profile Header -->
	<div class="rounded-lg bg-white p-6 shadow">
		<div class="flex items-center gap-6">
			<!-- Profile Photo Placeholder -->
			<div
				class="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-3xl font-bold text-gray-600"
			>
				{cyclist.user?.firstName.charAt(0)}{cyclist.user?.lastName?.charAt(0) || ''}
			</div>

			<!-- Personal Information -->
			<div class="flex-1">
				<h2 class="mb-2 text-3xl font-bold">
					{cyclist.user?.firstName}
					{cyclist.user?.lastName || ''}
				</h2>

				<div class="space-y-1 text-gray-600">
					{#if cyclist.bornYear}
						<p>{$t('cyclists.profile.bornYear')}: {cyclist.bornYear}</p>
					{/if}
					{#if cyclist.gender}
						<p>{$t('cyclists.profile.gender')}: {cyclist.gender.name}</p>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Race Results Section -->
	<div>
		<h3 class="mb-4 text-2xl font-bold">{$t('cyclists.profile.raceHistory')}</h3>

		{#if cyclist.raceResults && cyclist.raceResults.length > 0}
			<CyclistResultsTable raceResults={cyclist.raceResults} />
		{:else}
			<div class="rounded-lg bg-gray-50 py-8 text-center text-gray-500">
				{$t('cyclists.profile.noResults')}
			</div>
		{/if}
	</div>
</div>

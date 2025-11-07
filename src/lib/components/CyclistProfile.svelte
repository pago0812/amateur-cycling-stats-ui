<script lang="ts">
	import CyclistResultsTable from '$lib/components/CyclistResultsTable.svelte';
	import { t } from '$lib/i18n';
	import type { CyclistWithRelations } from '$lib/types/domain';

	let { cyclist }: { cyclist: CyclistWithRelations } = $props();
</script>

<div class="space-y-8">
	<!-- Profile Header -->
	<div class="bg-white rounded-lg shadow p-6">
		<div class="flex items-center gap-6">
			<!-- Profile Photo Placeholder -->
			<div class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600">
				{cyclist.name.charAt(0)}{cyclist.lastName.charAt(0)}
			</div>

			<!-- Personal Information -->
			<div class="flex-1">
				<h2 class="text-3xl font-bold mb-2">
					{cyclist.name}
					{cyclist.lastName}
				</h2>

				<div class="text-gray-600 space-y-1">
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
		<h3 class="text-2xl font-bold mb-4">{$t('cyclists.profile.raceHistory')}</h3>

		{#if cyclist.raceResults && cyclist.raceResults.length > 0}
			<CyclistResultsTable raceResults={cyclist.raceResults} />
		{:else}
			<div class="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
				{$t('cyclists.profile.noResults')}
			</div>
		{/if}
	</div>
</div>

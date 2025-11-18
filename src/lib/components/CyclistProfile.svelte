<script lang="ts">
	import CyclistResultsTable from '$lib/components/CyclistResultsTable.svelte';
	import { t } from '$lib/i18n';
	import type { Cyclist, RaceResult } from '$lib/types/domain';

	let { cyclist, raceResults }: { cyclist: Cyclist; raceResults: RaceResult[] } = $props();
</script>

<div class="space-y-8">
	<!-- Profile Header -->
	<div class="rounded-lg bg-white p-6 shadow">
		<div class="flex items-center gap-6">
			<!-- Profile Photo Placeholder -->
			<div
				class="flex h-24 w-24 items-center justify-center rounded-full bg-muted text-3xl font-bold text-muted-foreground"
			>
				{cyclist.firstName.charAt(0)}{cyclist.lastName?.charAt(0) || ''}
			</div>

			<!-- Personal Information -->
			<div class="flex-1">
				<h2 class="mb-2 text-3xl font-bold">
					{cyclist.firstName}
					{cyclist.lastName || ''}
				</h2>

				<div class="space-y-1 text-muted-foreground">
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

		{#if raceResults && raceResults.length > 0}
			<CyclistResultsTable {raceResults} />
		{:else}
			<div class="rounded-lg bg-muted py-8 text-center text-muted-foreground">
				{$t('cyclists.profile.noResults')}
			</div>
		{/if}
	</div>
</div>

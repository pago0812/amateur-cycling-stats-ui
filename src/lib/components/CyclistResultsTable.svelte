<script lang="ts">
	import type { RaceResult } from '$lib/types/domain';
	import { formatDateToMMDD } from '$lib/utils/dates';
	import { t } from '$lib/i18n';
	import { translateCategory, translateLength } from '$lib/i18n/category-translations';

	let { raceResults }: { raceResults: RaceResult[] } = $props();

	function getEventUrl(result: RaceResult): string {
		return `/results/${result.eventId}?raceId=${result.raceId}`;
	}
</script>

<div class="overflow-x-auto rounded-lg bg-card shadow-md">
	<table class="min-w-full divide-y divide-border">
		<thead class="bg-muted/50">
			<tr>
				<th
					class="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
				>
					{$t('cyclists.table.date')}
				</th>
				<th
					class="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
				>
					{$t('cyclists.table.position')}
				</th>
				<th
					class="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
				>
					{$t('cyclists.table.race')}
				</th>
				<th
					class="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
				>
					{$t('cyclists.table.distance')}
				</th>
				<th
					class="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
				>
					{$t('cyclists.table.ranking')}
				</th>
				<th
					class="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
				>
					{$t('cyclists.table.category')}
				</th>
				<th
					class="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
				>
					{$t('cyclists.table.points')}
				</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-border bg-card">
			{#each raceResults as result (result.id)}
				<tr class="hover:bg-muted/30">
					<td class="px-6 py-4 text-sm whitespace-nowrap text-foreground">
						{formatDateToMMDD(result.raceDateTime)}
					</td>
					<td class="px-6 py-4 text-sm whitespace-nowrap text-foreground">
						{result.place}
					</td>
					<td class="px-6 py-4 text-sm whitespace-nowrap text-foreground">
						<a
							href={getEventUrl(result)}
							class="text-primary hover:text-primary/80 hover:underline"
						>
							{result.eventName}
						</a>
					</td>
					<td class="px-6 py-4 text-sm whitespace-nowrap text-foreground">
						{result.raceCategoryLengthType ? translateLength(result.raceCategoryLengthType) : '-'}
					</td>
					<td class="px-6 py-4 text-sm whitespace-nowrap text-foreground">
						{result.raceRankingType || '-'}
					</td>
					<td class="px-6 py-4 text-sm whitespace-nowrap text-foreground">
						{result.raceCategoryType ? translateCategory(result.raceCategoryType) : '-'}
					</td>
					<td class="px-6 py-4 text-sm whitespace-nowrap text-foreground">
						{result.points || '-'}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

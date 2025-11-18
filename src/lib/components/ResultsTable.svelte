<script lang="ts">
	import type { RaceDetailResult } from '$lib/types/services/races';
	import { t } from '$lib/i18n';

	let { raceResults }: { raceResults: RaceDetailResult[] } = $props();
</script>

<div class="overflow-x-auto rounded-lg bg-card shadow-md">
	<table class="min-w-full divide-y divide-border">
		<thead class="bg-muted/50">
			<tr>
				<th
					class="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
				>
					{$t('races.table.position')}
				</th>
				<th
					class="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
				>
					{$t('races.table.name')}
				</th>
				<th
					class="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
				>
					{$t('races.table.time')}
				</th>
				<th
					class="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
				>
					{$t('races.table.points')}
				</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-border bg-card">
			{#each raceResults as result (result.id)}
				<tr class="hover:bg-muted/30">
					<td class="px-6 py-4 text-sm whitespace-nowrap text-foreground">
						{result.place}
					</td>
					<td class="px-6 py-4 text-sm whitespace-nowrap text-foreground">
						{#if result.cyclistId}
							<a
								href="/cyclists/{result.cyclistId}"
								class="text-primary hover:text-primary/80 hover:underline"
							>
								{result.cyclistFirstName}
								{result.cyclistLastName}
							</a>
						{:else}
							-
						{/if}
					</td>
					<td class="px-6 py-4 text-sm whitespace-nowrap text-foreground">
						{result.time || '-'}
					</td>
					<td class="px-6 py-4 text-sm whitespace-nowrap text-foreground">
						{result.points || '-'}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

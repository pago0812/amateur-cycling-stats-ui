<script lang="ts">
	import type { RaceResultWithRelations } from '$lib/types/domain';
	import { t } from '$lib/i18n';

	let { raceResults }: { raceResults: RaceResultWithRelations[] } = $props();
</script>

<div class="overflow-x-auto bg-white shadow-md rounded-lg">
	<table class="min-w-full divide-y divide-gray-200">
		<thead class="bg-gray-50">
			<tr>
				<th
					class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
				>
					{$t('races.table.position')}
				</th>
				<th
					class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
				>
					{$t('races.table.name')}
				</th>
				<th
					class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
				>
					{$t('races.table.time')}
				</th>
				<th
					class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
				>
					{$t('races.table.points')}
				</th>
			</tr>
		</thead>
		<tbody class="bg-white divide-y divide-gray-200">
			{#each raceResults as result (result.id)}
				<tr class="hover:bg-gray-50">
					<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
						{result.place}
					</td>
					<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
						{#if result.cyclist}
							<a
								href="/cyclists/{result.cyclist.id}"
								class="text-blue-600 hover:text-blue-800 hover:underline"
							>
								{result.cyclist.lastName}
								{result.cyclist.name}
							</a>
						{:else}
							-
						{/if}
					</td>
					<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
						{result.time || '-'}
					</td>
					<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
						{result.rankingPoint?.points || '-'}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

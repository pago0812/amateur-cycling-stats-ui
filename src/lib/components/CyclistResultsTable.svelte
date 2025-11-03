<script lang="ts">
	import type { RaceResult } from '$lib/types/entities/race-results';
	import { formatDateToMMDD } from '$lib/utils/dates';

	let { raceResults }: { raceResults: RaceResult[] } = $props();

	function getEventUrl(result: RaceResult): string {
		return `/results/${result?.race?.event?.documentId}?category=${result?.race?.raceCategory?.documentId}&gender=${result?.race?.raceCategoryGender?.documentId}&length=${result?.race?.raceCategoryLength?.documentId}`;
	}
</script>

<div class="overflow-x-auto bg-white shadow-md rounded-lg">
	<table class="min-w-full divide-y divide-gray-200">
		<thead class="bg-gray-50">
			<tr>
				<th
					class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
				>
					Fecha
				</th>
				<th
					class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
				>
					Posición
				</th>
				<th
					class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
				>
					Carrera
				</th>
				<th
					class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
				>
					Distancia
				</th>
				<th
					class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
				>
					Ranking
				</th>
				<th
					class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
				>
					Categoría
				</th>
				<th
					class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
				>
					Puntos
				</th>
			</tr>
		</thead>
		<tbody class="bg-white divide-y divide-gray-200">
			{#each raceResults as result (result.documentId)}
				<tr class="hover:bg-gray-50">
					<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
						{formatDateToMMDD(result.race?.dateTime)}
					</td>
					<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
						{result.place}
					</td>
					<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
						<a
							href={getEventUrl(result)}
							class="text-blue-600 hover:text-blue-800 hover:underline"
						>
							{result?.race?.event?.name}
						</a>
					</td>
					<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
						{result.race?.raceCategoryLength?.name || '-'}
					</td>
					<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
						{result.race?.raceRanking?.name || '-'}
					</td>
					<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
						{result.race?.raceCategory?.name || '-'}
					</td>
					<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
						{result.rankingPoint?.points || '-'}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

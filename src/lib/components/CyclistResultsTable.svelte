<script lang="ts">
	import type { RaceResultWithRelations } from '$lib/types/domain';
	import { formatDateToMMDD } from '$lib/utils/dates';
	import { t } from '$lib/i18n';
	import { translateCategory, translateLength } from '$lib/i18n/category-translations';

	let { raceResults }: { raceResults: RaceResultWithRelations[] } = $props();

	function getEventUrl(result: RaceResultWithRelations): string {
		return `/results/${result?.race?.event?.id}?category=${result?.race?.raceCategory?.id}&gender=${result?.race?.raceCategoryGender?.id}&length=${result?.race?.raceCategoryLength?.id}`;
	}
</script>

<div class="overflow-x-auto rounded-lg bg-white shadow-md">
	<table class="min-w-full divide-y divide-gray-200">
		<thead class="bg-gray-50">
			<tr>
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
					{$t('cyclists.table.date')}
				</th>
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
					{$t('cyclists.table.position')}
				</th>
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
					{$t('cyclists.table.race')}
				</th>
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
					{$t('cyclists.table.distance')}
				</th>
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
					{$t('cyclists.table.ranking')}
				</th>
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
					{$t('cyclists.table.category')}
				</th>
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
					{$t('cyclists.table.points')}
				</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-200 bg-white">
			{#each raceResults as result (result.id)}
				<tr class="hover:bg-gray-50">
					<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
						{formatDateToMMDD(result.race?.dateTime)}
					</td>
					<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
						{result.place}
					</td>
					<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
						<a href={getEventUrl(result)} class="text-blue-600 hover:text-blue-800 hover:underline">
							{result?.race?.event?.name}
						</a>
					</td>
					<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
						{result.race?.raceCategoryLength?.name
							? translateLength(result.race.raceCategoryLength.name)
							: '-'}
					</td>
					<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
						{result.race?.raceRanking?.name || '-'}
					</td>
					<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
						{result.race?.raceCategory?.name
							? translateCategory(result.race.raceCategory.name)
							: '-'}
					</td>
					<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
						{result.rankingPoint?.points || '-'}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

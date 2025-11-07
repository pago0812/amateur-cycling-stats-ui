<script lang="ts">
	import type { Event } from '$lib/types/domain';
	import { formatDateToMMDD } from '$lib/utils/dates';

	let { events }: { events: Event[] } = $props();
</script>

<div class="overflow-x-auto rounded-lg bg-white shadow-md">
	<table class="min-w-full divide-y divide-gray-200">
		<thead class="bg-gray-50">
			<tr>
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
					Fecha
				</th>
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
					Evento
				</th>
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
					Lugar
				</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-200 bg-white">
			{#each events as event (event.id)}
				<tr class="hover:bg-gray-50">
					<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
						{formatDateToMMDD(event.dateTime)}
					</td>
					<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
						<a href="/results/{event.id}" class="text-blue-600 hover:text-blue-800 hover:underline">
							{event.name}
						</a>
					</td>
					<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
						{event.state}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

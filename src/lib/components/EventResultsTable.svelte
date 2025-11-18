<script lang="ts">
	import type { Event } from '$lib/types/domain';
	import { formatDateToMMDD } from '$lib/utils/dates';

	let { events }: { events: Event[] } = $props();
</script>

<div class="overflow-x-auto rounded-lg bg-white shadow-md">
	<table class="min-w-full divide-y divide-border">
		<thead class="bg-muted">
			<tr>
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
					Fecha
				</th>
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
					Evento
				</th>
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
					Lugar
				</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-border bg-white">
			{#each events as event (event.id)}
				<tr class="hover:bg-muted">
					<td class="px-6 py-4 text-sm whitespace-nowrap text-foreground">
						{formatDateToMMDD(event.dateTime)}
					</td>
					<td class="px-6 py-4 text-sm whitespace-nowrap text-foreground">
						<a href="/results/{event.id}" class="text-blue-600 hover:text-blue-800 hover:underline">
							{event.name}
						</a>
					</td>
					<td class="px-6 py-4 text-sm whitespace-nowrap text-foreground">
						{event.state}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

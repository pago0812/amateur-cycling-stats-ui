<script lang="ts">
	import type { EventWithRaceCount } from '$lib/types/services';
	import type { Event } from '$lib/types/domain';
	import { t } from '$lib/i18n';
	import { Badge } from '$lib/components/ui/badge';

	let { events }: { events: EventWithRaceCount[] } = $props();

	// Format date to locale string
	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Get location string
	function getLocation(event: EventWithRaceCount): string {
		const parts = [event.city, event.state, event.country].filter(Boolean);
		return parts.join(', ') || '-';
	}

	// Get status badge variant based on event status
	function getStatusVariant(
		status: Event['eventStatus']
	): 'default' | 'secondary' | 'destructive' | 'outline' {
		switch (status) {
			case 'AVAILABLE':
				return 'default';
			case 'DRAFT':
				return 'secondary';
			case 'SOLD_OUT':
				return 'destructive';
			case 'ON_GOING':
				return 'default';
			case 'FINISHED':
				return 'outline';
			default:
				return 'secondary';
		}
	}

	// Get status label from translations
	function getStatusLabel(status: Event['eventStatus']): string {
		return $t(`panel.events.status.${status}`);
	}
</script>

<div class="overflow-x-auto rounded-lg bg-card shadow-md">
	<table class="min-w-full divide-y divide-border">
		<thead class="bg-muted/50">
			<tr>
				<th
					class="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
				>
					{$t('panel.events.table.date')}
				</th>
				<th
					class="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
				>
					{$t('panel.events.table.name')}
				</th>
				<th
					class="hidden px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase md:table-cell"
				>
					{$t('panel.events.table.location')}
				</th>
				<th
					class="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
				>
					{$t('panel.events.table.status')}
				</th>
				<th
					class="hidden px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase sm:table-cell"
				>
					{$t('panel.events.table.races')}
				</th>
				<th
					class="hidden px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase lg:table-cell"
				>
					{$t('panel.events.table.visible')}
				</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-border bg-card">
			{#if events.length === 0}
				<tr>
					<td colspan="6" class="px-6 py-12 text-center">
						<p class="text-lg font-medium text-muted-foreground">
							{$t('panel.events.empty.title')}
						</p>
						<p class="mt-1 text-sm text-muted-foreground">
							{$t('panel.events.empty.description')}
						</p>
					</td>
				</tr>
			{:else}
				{#each events as event (event.id)}
					<tr class="cursor-pointer transition-colors hover:bg-muted/30">
						<td class="px-6 py-4 text-sm whitespace-nowrap text-muted-foreground">
							<a href="/panel/events/{event.id}" class="block">
								{formatDate(event.dateTime)}
							</a>
						</td>
						<td class="px-6 py-4 text-sm whitespace-nowrap text-foreground">
							<a
								href="/panel/events/{event.id}"
								class="block font-medium text-primary hover:text-primary/80"
							>
								{event.name}
							</a>
						</td>
						<td class="hidden px-6 py-4 text-sm text-muted-foreground md:table-cell">
							<a href="/panel/events/{event.id}" class="block">
								{getLocation(event)}
							</a>
						</td>
						<td class="px-6 py-4 text-sm whitespace-nowrap">
							<a href="/panel/events/{event.id}" class="block">
								<Badge variant={getStatusVariant(event.eventStatus)}>
									{getStatusLabel(event.eventStatus)}
								</Badge>
							</a>
						</td>
						<td class="hidden px-6 py-4 text-sm text-foreground sm:table-cell">
							<a href="/panel/events/{event.id}" class="block">
								{event.raceCount}
							</a>
						</td>
						<td class="hidden px-6 py-4 text-sm lg:table-cell">
							<a href="/panel/events/{event.id}" class="block">
								<Badge variant={event.isPublicVisible ? 'default' : 'outline'}>
									{event.isPublicVisible
										? $t('panel.events.visibility.visible')
										: $t('panel.events.visibility.hidden')}
								</Badge>
							</a>
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

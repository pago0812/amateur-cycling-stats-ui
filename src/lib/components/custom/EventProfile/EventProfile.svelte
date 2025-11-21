<script lang="ts">
	import type { Event } from '$lib/types/domain';
	import { t } from '$lib/i18n';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';

	let { event }: { event: Event } = $props();

	// Format date to locale string
	function formatDateTime(dateString: string): string {
		return new Date(dateString).toLocaleDateString('es-ES', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Get location string
	function getLocation(): string {
		const parts = [event.city, event.state, event.country].filter(Boolean);
		return parts.join(', ') || '-';
	}

	// Get status badge variant
	function getStatusVariant(): 'default' | 'secondary' | 'destructive' | 'outline' {
		switch (event.eventStatus) {
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
</script>

<Card.Root>
	<Card.Header>
		<div class="flex items-start justify-between">
			<div>
				<Card.Title class="text-2xl">{event.name}</Card.Title>
				<Card.Description class="mt-1">{formatDateTime(event.dateTime)}</Card.Description>
			</div>
			<div class="flex gap-2">
				<Badge variant={getStatusVariant()}>
					{$t(`panel.events.status.${event.eventStatus}`)}
				</Badge>
				<Badge variant={event.isPublicVisible ? 'default' : 'outline'}>
					{event.isPublicVisible
						? $t('panel.events.visibility.visible')
						: $t('panel.events.visibility.hidden')}
				</Badge>
			</div>
		</div>
	</Card.Header>
	<Card.Content>
		<dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			{#if event.description}
				<div class="sm:col-span-2">
					<dt class="text-sm font-medium text-muted-foreground">
						{$t('panel.events.detail.fields.description')}
					</dt>
					<dd class="mt-1 text-sm text-foreground">{event.description}</dd>
				</div>
			{/if}

			<div>
				<dt class="text-sm font-medium text-muted-foreground">
					{$t('panel.events.detail.fields.location')}
				</dt>
				<dd class="mt-1 text-sm text-foreground">{getLocation()}</dd>
			</div>

			<div>
				<dt class="text-sm font-medium text-muted-foreground">
					{$t('panel.events.detail.fields.country')}
				</dt>
				<dd class="mt-1 text-sm text-foreground">{event.country}</dd>
			</div>

			<div>
				<dt class="text-sm font-medium text-muted-foreground">
					{$t('panel.events.detail.fields.state')}
				</dt>
				<dd class="mt-1 text-sm text-foreground">{event.state}</dd>
			</div>

			{#if event.city}
				<div>
					<dt class="text-sm font-medium text-muted-foreground">
						{$t('panel.events.detail.fields.city')}
					</dt>
					<dd class="mt-1 text-sm text-foreground">{event.city}</dd>
				</div>
			{/if}
		</dl>
	</Card.Content>
</Card.Root>

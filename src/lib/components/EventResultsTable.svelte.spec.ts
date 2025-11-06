/**
 * Unit Tests: EventResultsTable Component
 *
 * Tests the event results table component.
 */

import { page } from '@vitest/browser/context';
import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import EventResultsTable from './EventResultsTable.svelte';
import type { Event } from '$lib/types/domain';

describe('EventResultsTable Component', () => {
	const mockEvents: Event[] = [
		{
			id: 'event-1',
			name: 'Gran Fondo Valencia 2024',
			description: 'Annual cycling event',
			dateTime: '2024-06-15T12:00:00Z',
			year: 2024,
			city: 'Valencia',
			state: 'Valencia',
			country: 'Spain',
			eventStatus: 'FINISHED',
			isPublicVisible: true,
			organizationId: 'org-1',
			createdBy: 'user-1',
			createdAt: '2024-01-01T00:00:00Z',
			updatedAt: '2024-01-01T00:00:00Z'
		}
	];

	it('should render table headers', async () => {
		render(EventResultsTable, { events: mockEvents });

		const dateHeader = page.getByText('Fecha');
		await expect.element(dateHeader).toBeInTheDocument();
	});

	it('should render event links', async () => {
		render(EventResultsTable, { events: mockEvents });

		const link = page.getByRole('link', { name: 'Gran Fondo Valencia 2024' });
		await expect.element(link).toHaveAttribute('href', '/results/event-1');
	});

	it('should handle empty events array', async () => {
		render(EventResultsTable, { events: [] });

		const dateHeader = page.getByText('Fecha');
		await expect.element(dateHeader).toBeInTheDocument();
	});
});

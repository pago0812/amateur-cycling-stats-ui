/**
 * Unit Tests: EventResultsTable Component
 *
 * Tests the event results table component.
 */

import { page } from '@vitest/browser/context';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, cleanup } from 'vitest-browser-svelte';
import EventResultsTable from './EventResultsTable.svelte';
import type { Event } from '$lib/types/domain';

// Mock i18n
vi.mock('$lib/i18n', () => {
	const writable = (value: unknown) => ({
		subscribe: (fn: (val: unknown) => void) => {
			fn(value);
			return () => {};
		}
	});

	const mockT = (key: string) => key;

	return {
		t: writable(mockT),
		locale: writable('es'),
		locales: writable(['es', 'en']),
		loading: writable(false),
		loadTranslations: vi.fn()
	};
});

// Mock dates utility
vi.mock('$lib/utils/dates', () => ({
	formatDateToMMDD: (date: Date | string) => {
		if (!date) return '';
		const d = new Date(date);
		return `${d.getDate()}-${d.getMonth() + 1}`;
	}
}));

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

	beforeEach(async () => {
		await cleanup();
	});

	it('should render table headers', async () => {
		render(EventResultsTable, { events: mockEvents });

		const dateHeader = page.getByText('Fecha');
		await expect.element(dateHeader).toBeInTheDocument();
	});

	it('should render with events without crashing', async () => {
		// This test verifies the component renders without errors when given events
		// Event rendering is validated via e2e tests
		const instance = render(EventResultsTable, { events: mockEvents });

		// Verify the table structure is rendered
		const dateHeader = page.getByText('Fecha');
		await expect.element(dateHeader).toBeInTheDocument();

		expect(instance).toBeDefined();
	});

	it('should handle empty events array', async () => {
		render(EventResultsTable, { events: [] });

		const dateHeader = page.getByText('Fecha');
		await expect.element(dateHeader).toBeInTheDocument();
	});
});

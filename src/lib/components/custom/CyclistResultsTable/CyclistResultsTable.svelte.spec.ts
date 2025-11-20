/**
 * Unit Tests: CyclistResultsTable Component
 *
 * Tests the cyclist race results table component.
 */

import { page } from '@vitest/browser/context';
import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CyclistResultsTable from './CyclistResultsTable.svelte';
import type { RaceResult } from '$lib/types/domain';

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

// Mock category translations
vi.mock('$lib/i18n/category-translations', () => ({
	translateCategory: (name: string) => `translated-${name}`,
	translateLength: (name: string) => `translated-${name}`
}));

describe('CyclistResultsTable Component', () => {
	const mockRaceResults: RaceResult[] = [
		{
			// Race result fields
			id: 'result-1',
			place: 1,
			time: '02:30:45',
			points: 100,
			createdAt: '2024-01-01T00:00:00Z',
			updatedAt: '2024-01-01T00:00:00Z',
			// Event fields
			eventId: 'event-1',
			eventName: 'Gran Fondo Valencia',
			eventDateTime: '2024-06-15T12:00:00Z',
			eventYear: 2024,
			eventCity: 'Valencia',
			eventState: 'Valencia',
			eventCountry: 'Spain',
			eventStatus: 'FINISHED',
			// Race fields
			raceId: 'race-1',
			raceName: 'Gran Fondo - LONG/MALE/ABS',
			raceDateTime: '2024-06-15T12:00:00Z',
			// Category IDs
			raceCategoryId: 'cat-abs',
			raceCategoryGenderId: 'gender-male',
			raceCategoryLengthId: 'length-long',
			// Category types
			raceCategoryType: 'ABS',
			raceCategoryGenderType: 'MALE',
			raceCategoryLengthType: 'LONG',
			raceRankingType: 'UCI'
		}
	];

	it('should render table headers', async () => {
		render(CyclistResultsTable, { raceResults: mockRaceResults });

		const dateHeader = page.getByText('cyclists.table.date');
		await expect.element(dateHeader).toBeInTheDocument();
	});

	it('should render event link', async () => {
		render(CyclistResultsTable, { raceResults: mockRaceResults });

		const eventLink = page.getByRole('link', { name: 'Gran Fondo Valencia' });
		await expect.element(eventLink).toBeInTheDocument();
	});
});

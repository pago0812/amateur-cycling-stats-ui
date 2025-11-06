/**
 * Unit Tests: CyclistResultsTable Component
 *
 * Tests the cyclist race results table component.
 */

import { page } from '@vitest/browser/context';
import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CyclistResultsTable from './CyclistResultsTable.svelte';
import type { RaceResultWithRelations } from '$lib/types/domain';

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
	const mockRaceResults: RaceResultWithRelations[] = [
		{
			id: 'result-1',
			place: 1,
			time: '02:30:45',
			raceId: 'race-1',
			cyclistId: 'cyclist-1',
			rankingPointId: 'rp-1',
			createdAt: '2024-01-01T00:00:00Z',
			updatedAt: '2024-01-01T00:00:00Z',
			cyclist: null,
			race: {
				id: 'race-1',
				name: 'Gran Fondo - LONG/MALE/ABS',
				description: 'Long distance race',
				dateTime: '2024-06-15T12:00:00Z',
				isPublicVisible: true,
				eventId: 'event-1',
				raceCategoryId: 'cat-abs',
				raceCategoryGenderId: 'gender-male',
				raceCategoryLengthId: 'length-long',
				raceRankingId: 'ranking-uci',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
				event: {
					id: 'event-1',
					name: 'Gran Fondo Valencia',
					description: 'Annual event',
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
				},
				raceCategory: null,
				raceCategoryGender: null,
				raceCategoryLength: null,
				raceRanking: null
			},
			rankingPoint: null
		}
	];

	it('should render table headers', async () => {
		render(CyclistResultsTable, { props: { raceResults: mockRaceResults } });

		const dateHeader = page.getByText('cyclists.table.date');
		await expect.element(dateHeader).toBeInTheDocument();
	});

	it('should render event link', async () => {
		render(CyclistResultsTable, { props: { raceResults: mockRaceResults } });

		const eventLink = page.getByRole('link', { name: 'Gran Fondo Valencia' });
		await expect.element(eventLink).toBeInTheDocument();
	});
});

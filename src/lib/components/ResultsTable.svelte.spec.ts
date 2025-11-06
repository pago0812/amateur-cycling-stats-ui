/**
 * Unit Tests: ResultsTable Component
 *
 * Tests the race results table component.
 */

import { page } from '@vitest/browser/context';
import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ResultsTable from './ResultsTable.svelte';
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

describe('ResultsTable Component', () => {
	const mockRaceResults: RaceResultWithRelations[] = [
		{
			id: 'result-1',
			place: 1,
			time: '02:30:45',
			points: 100,
			raceId: 'race-1',
			cyclistId: 'cyclist-1',
			rankingPointId: 'rp-1',
			createdAt: '2024-01-01T00:00:00Z',
			updatedAt: '2024-01-01T00:00:00Z',
			cyclist: {
				id: 'cyclist-1',
				name: 'Carlos',
				lastName: 'Rodríguez',
				bornYear: 1995,
				genderId: 'gender-male',
				userId: null,
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			},
			race: undefined,
			rankingPoint: {
				id: 'rp-1',
				place: 1,
				points: 100,
				raceRankingId: 'ranking-uci',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			}
		}
	];

	it('should render table headers', async () => {
		render(ResultsTable, { raceResults: mockRaceResults });

		const positionHeader = page.getByText('races.table.position');
		await expect.element(positionHeader).toBeInTheDocument();
	});

	it('should render cyclist link', async () => {
		render(ResultsTable, { raceResults: mockRaceResults });

		const cyclistLink = page.getByRole('link', { name: /Rodríguez.*Carlos/ });
		await expect.element(cyclistLink).toHaveAttribute('href', '/cyclists/cyclist-1');
	});

	it('should handle missing cyclist data', async () => {
		const resultsWithoutCyclist: RaceResultWithRelations[] = [
			{
				id: 'result-2',
				place: 2,
				time: null,
				points: null,
				raceId: 'race-1',
				cyclistId: 'cyclist-id',
				rankingPointId: 'rp-2',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
				cyclist: undefined,
				race: undefined,
				rankingPoint: undefined
			}
		];

		render(ResultsTable, { raceResults: resultsWithoutCyclist });

		const positionHeader = page.getByText('races.table.position');
		await expect.element(positionHeader).toBeInTheDocument();
	});
});

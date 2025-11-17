/**
 * Unit Tests: ResultsTable Component
 *
 * Tests the race results table component.
 */

import { page } from '@vitest/browser/context';
import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ResultsTable from './ResultsTable.svelte';
import type { RaceDetailResult } from '$lib/types/services/races';

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
	const mockRaceResults: RaceDetailResult[] = [
		{
			id: 'result-1',
			place: 1,
			time: '02:30:45',
			points: 100,
			cyclistId: 'cyclist-1',
			cyclistFirstName: 'John',
			cyclistLastName: 'Doe',
			createdAt: '2024-01-01T00:00:00Z',
			updatedAt: '2024-01-01T00:00:00Z',
			rankingPoint: {
				id: 'rp-1',
				place: 1,
				points: 100,
				raceRankingId: 'ranking-uci'
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

		const cyclistLink = page.getByRole('link', { name: 'races.table.viewCyclist' });
		await expect.element(cyclistLink).toHaveAttribute('href', '/cyclists/cyclist-1');
	});

	it('should handle missing cyclist data', async () => {
		const resultsWithoutCyclist: RaceDetailResult[] = [
			{
				id: 'result-2',
				place: 2,
				time: null,
				points: null,
				cyclistId: 'cyclist-id',
				cyclistFirstName: 'Jane',
				cyclistLastName: 'Smith',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
				rankingPoint: undefined
			}
		];

		render(ResultsTable, { raceResults: resultsWithoutCyclist });

		const positionHeader = page.getByText('races.table.position');
		await expect.element(positionHeader).toBeInTheDocument();
	});
});

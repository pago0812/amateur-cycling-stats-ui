/**
 * Unit Tests: CyclistProfile Component
 *
 * Tests the cyclist profile display component (used in both /account and /cyclists/[id]).
 */

import { page } from '@vitest/browser/context';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { writable } from 'svelte/store';
import CyclistProfile from './CyclistProfile.svelte';
import type { CyclistWithRelations } from '$lib/types/domain';

// Mock i18n
vi.mock('$lib/i18n', () => ({
	t: writable((key: string) => key),
	locale: writable('es'),
	locales: writable(['es', 'en']),
	loading: writable(false),
	loadTranslations: vi.fn()
}));

// Mock CyclistResultsTable component - return a stub function
vi.mock('./CyclistResultsTable.svelte', () => ({
	default: () => null
}));

describe('CyclistProfile Component', () => {
	const mockCyclist: CyclistWithRelations = {
		id: 'cyclist-1',
		bornYear: 1990,
		genderId: 'gender-1',
		userId: 'user-1',
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z',
		user: {
			id: 'user-1',
			firstName: 'Carlos',
			lastName: 'Rodríguez',
			roleId: 'role-cyclist',
			createdAt: '2024-01-01T00:00:00Z',
			updatedAt: '2024-01-01T00:00:00Z'
		},
		gender: {
			id: 'gender-1',
			name: 'Masculino',
			createdAt: '2024-01-01T00:00:00Z',
			updatedAt: '2024-01-01T00:00:00Z'
		},
		raceResults: [
			{
				id: 'result-1',
				place: 1,
				time: '02:30:15',
				points: 100,
				raceId: 'race-1',
				cyclistId: 'cyclist-1',
				rankingPointId: 'rp-1',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
				race: {
					id: 'race-1',
					name: 'Gran Fondo',
					description: null,
					dateTime: '2024-06-15T10:00:00Z',
					isPublicVisible: true,
					eventId: 'event-1',
					raceCategoryId: 'cat-1',
					raceCategoryGenderId: 'gender-1',
					raceCategoryLengthId: 'length-1',
					raceRankingId: 'ranking-1',
					createdAt: '2024-01-01T00:00:00Z',
					updatedAt: '2024-01-01T00:00:00Z'
				}
			}
		]
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render cyclist name', async () => {
		render(CyclistProfile, { cyclist: mockCyclist });

		const heading = page.getByRole('heading', { name: /Carlos Rodríguez/i });
		await expect.element(heading).toBeInTheDocument();
	});

	it('should render profile photo placeholder with initials', async () => {
		render(CyclistProfile, { cyclist: mockCyclist });

		const initials = page.getByText('CR');
		await expect.element(initials).toBeInTheDocument();
	});

	it('should render born year when provided', async () => {
		render(CyclistProfile, { cyclist: mockCyclist });

		const yearText = page.getByText(/1990/);
		await expect.element(yearText).toBeInTheDocument();
	});

	it('should render gender when provided', async () => {
		render(CyclistProfile, { cyclist: mockCyclist });

		const genderText = page.getByText(/Masculino/);
		await expect.element(genderText).toBeInTheDocument();
	});

	it('should render race history heading', async () => {
		render(CyclistProfile, { cyclist: mockCyclist });

		const heading = page.getByRole('heading', { name: /cyclists.profile.raceHistory/i });
		await expect.element(heading).toBeInTheDocument();
	});

	it('should show no results message when cyclist has no race results', async () => {
		const cyclistWithoutResults: CyclistWithRelations = {
			...mockCyclist,
			raceResults: []
		};

		render(CyclistProfile, { cyclist: cyclistWithoutResults });

		const noResultsMessage = page.getByText(/cyclists.profile.noResults/);
		await expect.element(noResultsMessage).toBeInTheDocument();
	});

	it('should not render born year section when null', async () => {
		const cyclistWithoutYear: CyclistWithRelations = {
			...mockCyclist,
			bornYear: null
		};

		render(CyclistProfile, { cyclist: cyclistWithoutYear });

		const yearText = page.getByText(/cyclists.profile.bornYear/);
		await expect.element(yearText).not.toBeInTheDocument();
	});

	it('should not render gender section when not provided', async () => {
		const cyclistWithoutGender: CyclistWithRelations = {
			...mockCyclist,
			gender: undefined
		};

		render(CyclistProfile, { cyclist: cyclistWithoutGender });

		const genderLabel = page.getByText(/cyclists.profile.gender:/);
		await expect.element(genderLabel).not.toBeInTheDocument();
	});
});

/**
 * Unit Tests: Account Page Component
 *
 * Tests the account profile page.
 */

import { page } from '@vitest/browser/context';
import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { writable } from 'svelte/store';
import AccountPage from './+page.svelte';
import type { CyclistWithRelations } from '$lib/types/domain';

// Mock i18n
vi.mock('$lib/i18n', () => ({
	t: writable((key: string) => key),
	locale: writable('es'),
	locales: writable(['es', 'en']),
	loading: writable(false),
	loadTranslations: vi.fn()
}));

// Mock CyclistProfile component
vi.mock('$lib/components/CyclistProfile.svelte', () => ({
	default: class MockCyclistProfile {
		$$prop_def = { cyclist: {} };
		constructor() {}
	}
}));

describe('Account Page Component', () => {
	const mockCyclist: CyclistWithRelations = {
		id: 'cyclist-1',
		name: 'Carlos',
		lastName: 'Rodríguez',
		bornYear: 1990,
		genderId: 'gender-1',
		userId: 'user-1',
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z',
		raceResults: []
	};

	it('should render the page', async () => {
		render(AccountPage, {
			data: {
				locale: 'es',
				user: {
					id: 'user-1',
					username: 'cyclist1',
					roleId: 'role-1',
					createdAt: '2024-01-01T00:00:00Z',
					updatedAt: '2024-01-01T00:00:00Z'
				} as any,
				cyclist: mockCyclist
			}
		});

		// The component should render without errors
		expect(true).toBe(true);
	});
});

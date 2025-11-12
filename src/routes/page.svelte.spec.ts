import { page } from '@vitest/browser/context';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import type { Event } from '$lib/types/domain';

// Mock i18n
vi.mock('$lib/i18n', () => {
	const writable = (value: any) => ({
		subscribe: (fn: (val: any) => void) => {
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

describe('/+page.svelte', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render h2 heading', async () => {
		const mockData = {
			locale: 'es',
			user: null,
			events: [],
			error: ''
		};

		render(Page, { data: mockData });

		const heading = page.getByRole('heading', { level: 2 });
		await expect.element(heading).toBeInTheDocument();
	});

	it('should display no events message when events array is empty', async () => {
		const mockData = {
			locale: 'es',
			user: null,
			events: [],
			error: ''
		};

		render(Page, { data: mockData });

		const message = page.getByText('events.home.noResults');
		await expect.element(message).toBeInTheDocument();
	});

	it('should display error message when error exists', async () => {
		const mockData = {
			locale: 'es',
			user: null,
			events: [],
			error: 'Test error message'
		};

		render(Page, { data: mockData });

		const errorMessage = page.getByText(/common.general.error/);
		await expect.element(errorMessage).toBeInTheDocument();
	});

	it('should display events when events array has items', async () => {
		const mockEvent: Event = {
			id: '1',
			name: 'Test Event',
			description: 'Test Description',
			dateTime: '2024-06-15T09:00:00Z',
			year: 2024,
			city: 'Valencia',
			state: 'Valencia',
			country: 'Spain',
			eventStatus: 'AVAILABLE',
			isPublicVisible: true,
			organizationId: 'org-1',
			createdBy: 'user-1',
			createdAt: '2024-01-01T00:00:00Z',
			updatedAt: '2024-01-01T00:00:00Z'
		};

		const mockData = {
			locale: 'es',
			user: null,
			events: [mockEvent],
			error: ''
		};

		render(Page, { data: mockData });

		const eventName = page.getByText('Test Event');
		await expect.element(eventName).toBeInTheDocument();
	});
});

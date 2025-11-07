/**
 * Unit Tests: Account Layout Component
 *
 * Tests the account page layout with secondary navigation.
 */

import { page } from '@vitest/browser/context';
import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { writable } from 'svelte/store';
import AccountLayout from './+layout.svelte';

// Mock i18n
vi.mock('$lib/i18n', () => ({
	t: writable((key: string) => {
		const translations: Record<string, string> = {
			'account.title': 'Mi Cuenta',
			'account.subtitle': 'Gestiona tu perfil',
			'account.tabs.profile': 'Perfil',
			'account.tabs.upcomingEvents': 'Eventos Próximos'
		};
		return translations[key] || key;
	}),
	locale: writable('es'),
	locales: writable(['es', 'en']),
	loading: writable(false),
	loadTranslations: vi.fn()
}));

// Mock $app/stores
vi.mock('$app/stores', () => ({
	page: writable({
		url: new URL('http://localhost:5173/account'),
		params: {},
		route: { id: '/account' },
		status: 200,
		error: null,
		data: {},
		form: null,
		state: {}
	})
}));

describe('Account Layout Component', () => {
	const mockData = {
		locale: 'es',
		user: {
			id: 'user-1',
			username: 'cyclist1',
			roleId: 'role-1',
			createdAt: '2024-01-01T00:00:00Z',
			updatedAt: '2024-01-01T00:00:00Z'
		}
	};

	it('should render page title', async () => {
		render(AccountLayout, { data: mockData, children: (() => {}) as any });

		const heading = page.getByRole('heading', { name: /Mi Cuenta/i });
		await expect.element(heading).toBeInTheDocument();
	});

	it('should render page subtitle', async () => {
		render(AccountLayout, { data: mockData, children: (() => {}) as any });

		const subtitle = page.getByText(/Gestiona tu perfil/i);
		await expect.element(subtitle).toBeInTheDocument();
	});

	it('should render Profile tab', async () => {
		render(AccountLayout, { data: mockData, children: (() => {}) as any });

		const profileTab = page.getByRole('link', { name: /Perfil/i });
		await expect.element(profileTab).toBeInTheDocument();
		await expect.element(profileTab).toHaveAttribute('href', '/account');
	});

	it('should render Upcoming Events tab', async () => {
		render(AccountLayout, { data: mockData, children: (() => {}) as any });

		const eventsTab = page.getByRole('link', { name: /Eventos Próximos/i });
		await expect.element(eventsTab).toBeInTheDocument();
		await expect.element(eventsTab).toHaveAttribute('href', '/account/events');
	});
});

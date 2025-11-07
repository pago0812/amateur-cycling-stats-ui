/**
 * Unit Tests: Panel Layout Component
 *
 * Tests the panel page layout with role-based navigation.
 */

import { page } from '@vitest/browser/context';
import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { writable } from 'svelte/store';
import PanelLayout from './+layout.svelte';
import { RoleTypeEnum } from '$lib/types/domain';

// Mock i18n
vi.mock('$lib/i18n', () => ({
	t: writable((key: string) => {
		const translations: Record<string, string> = {
			'panel.title': 'Panel de Control',
			'panel.subtitle': 'Gestiona tu organización',
			'panel.tabs.manageOrganization': 'Mi Organización',
			'panel.tabs.manageEvents': 'Eventos',
			'panel.tabs.manageOrganizers': 'Organizadores',
			'panel.tabs.manageOrganizations': 'Organizaciones'
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
		url: new URL('http://localhost:5173/panel/organization'),
		params: {},
		route: { id: '/panel/organization' },
		status: 200,
		error: null,
		data: {},
		form: null,
		state: {}
	})
}));

describe('Panel Layout Component', () => {
	const mockOrganizerData = {
		user: {
			id: 'user-1',
			username: 'organizer',
			roleId: 'role-2',
			createdAt: '2024-01-01T00:00:00Z',
			updatedAt: '2024-01-01T00:00:00Z',
			role: {
				id: 'role-2',
				name: RoleTypeEnum.ORGANIZER_ADMIN,
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			}
		}
	};

	const mockAdminData = {
		user: {
			id: 'user-admin',
			username: 'admin',
			roleId: 'role-admin',
			createdAt: '2024-01-01T00:00:00Z',
			updatedAt: '2024-01-01T00:00:00Z',
			role: {
				id: 'role-admin',
				name: RoleTypeEnum.ADMIN,
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			}
		}
	};

	it('should render page title', async () => {
		render(PanelLayout, { data: mockOrganizerData, children: () => {} });

		const heading = page.getByRole('heading', { name: /Panel de Control/i });
		await expect.element(heading).toBeInTheDocument();
	});

	it('should render 3 tabs for organizers', async () => {
		render(PanelLayout, { data: mockOrganizerData, children: () => {} });

		const orgTab = page.getByRole('link', { name: /Mi Organización/i });
		const eventsTab = page.getByRole('link', { name: /Eventos/i });
		const organizersTab = page.getByRole('link', { name: /Organizadores/i });

		await expect.element(orgTab).toBeInTheDocument();
		await expect.element(eventsTab).toBeInTheDocument();
		await expect.element(organizersTab).toBeInTheDocument();
	});

	it('should render 4 tabs for admins', async () => {
		render(PanelLayout, { data: mockAdminData, children: () => {} });

		const orgTab = page.getByRole('link', { name: /Mi Organización/i });
		const eventsTab = page.getByRole('link', { name: /Eventos/i });
		const organizersTab = page.getByRole('link', { name: /Organizadores/i });
		const organizationsTab = page.getByRole('link', { name: /Organizaciones/i });

		await expect.element(orgTab).toBeInTheDocument();
		await expect.element(eventsTab).toBeInTheDocument();
		await expect.element(organizersTab).toBeInTheDocument();
		await expect.element(organizationsTab).toBeInTheDocument();
	});

	it('should have correct href attributes', async () => {
		render(PanelLayout, { data: mockOrganizerData, children: () => {} });

		const orgTab = page.getByRole('link', { name: /Mi Organización/i });
		await expect.element(orgTab).toHaveAttribute('href', '/panel/organization');
	});
});

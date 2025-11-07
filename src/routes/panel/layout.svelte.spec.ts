/**
 * Unit Tests: Panel Layout Component
 *
 * Tests the panel page layout with role-based navigation.
 */

import { page } from '@vitest/browser/context';
import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PanelLayout from './+layout.svelte';
import { RoleTypeEnum } from '$lib/types/domain';

// Create a mock writable function using vi.hoisted
const mockWritable = vi.hoisted(() => {
	return (value: any) => ({
		subscribe: (fn: (value: any) => void) => {
			fn(value);
			return () => {};
		},
		set: (newValue: any) => {},
		update: (fn: (value: any) => any) => {}
	});
});

// Mock i18n
vi.mock('$lib/i18n', () => ({
	t: mockWritable((key: string) => {
		const translations: Record<string, string> = {
			'panel.title': 'Panel de Control',
			'panel.subtitle': 'Gestiona tu organización',
			'panel.tabs.overview': 'Resumen',
			'panel.tabs.manageEvents': 'Eventos',
			'panel.tabs.manageOrganizers': 'Organizadores'
		};
		return translations[key] || key;
	}),
	locale: mockWritable('es'),
	locales: mockWritable(['es', 'en']),
	loading: mockWritable(false),
	loadTranslations: vi.fn()
}));

// Mock $app/stores
vi.mock('$app/stores', () => ({
	page: mockWritable({
		url: new URL('http://localhost:5173/panel'),
		params: {},
		route: { id: '/panel' },
		status: 200,
		error: null,
		data: {},
		form: null,
		state: {}
	})
}));

describe('Panel Layout Component', () => {
	const mockOrganizerData = {
		locale: 'es',
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

	it('should render page title', async () => {
		render(PanelLayout, { data: mockOrganizerData, children: (() => {}) as any });

		const heading = page.getByRole('heading', { name: /Panel de Control/i });
		await expect.element(heading).toBeInTheDocument();
	});

	it('should render 3 tabs for organizers', async () => {
		render(PanelLayout, { data: mockOrganizerData, children: (() => {}) as any });

		const overviewTab = page.getByRole('link', { name: /Resumen/i });
		const eventsTab = page.getByRole('link', { name: /Eventos/i });
		const organizersTab = page.getByRole('link', { name: /Organizadores/i });

		await expect.element(overviewTab).toBeInTheDocument();
		await expect.element(eventsTab).toBeInTheDocument();
		await expect.element(organizersTab).toBeInTheDocument();
	});

	it('should have correct href attributes', async () => {
		render(PanelLayout, { data: mockOrganizerData, children: (() => {}) as any });

		const overviewTab = page.getByRole('link', { name: /Resumen/i });
		await expect.element(overviewTab).toHaveAttribute('href', '/panel');
	});
});

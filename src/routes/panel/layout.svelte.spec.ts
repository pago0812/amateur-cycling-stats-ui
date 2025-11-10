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
			'panel.tabs.members': 'Miembros',
			'common.navigation.logout': 'Cerrar sesión'
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

	it('should render page title in breadcrumb', async () => {
		render(PanelLayout, { data: mockOrganizerData, children: (() => {}) as any });

		const breadcrumb = page.getByText('Panel de Control');
		await expect.element(breadcrumb).toBeInTheDocument();
	});

	it('should render 2 tabs (Overview and Members)', async () => {
		render(PanelLayout, { data: mockOrganizerData, children: (() => {}) as any });

		const overviewTab = page.getByRole('link', { name: /Resumen/i });
		const membersTab = page.getByRole('link', { name: /Miembros/i });

		await expect.element(overviewTab).toBeInTheDocument();
		await expect.element(membersTab).toBeInTheDocument();
	});

	it('should have correct href attributes', async () => {
		render(PanelLayout, { data: mockOrganizerData, children: (() => {}) as any });

		const overviewTab = page.getByRole('link', { name: /Resumen/i });
		await expect.element(overviewTab).toHaveAttribute('href', '/panel');
	});
});

/**
 * Unit Tests: Admin Layout Component
 *
 * Tests the admin page layout with navigation.
 */

import { page } from '@vitest/browser/context';
import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { writable } from 'svelte/store';
import AdminLayout from './+layout.svelte';
import { RoleTypeEnum } from '$lib/types/domain';

// Mock i18n
vi.mock('$lib/i18n', () => ({
	t: writable((key: string) => {
		const translations: Record<string, string> = {
			'admin.title': 'Panel de Administración',
			'admin.subtitle': 'Gestiona la configuración del sistema',
			'admin.tabs.generalConfig': 'Configuración General'
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
		url: new URL('http://localhost:5173/admin'),
		params: {},
		route: { id: '/admin' },
		status: 200,
		error: null,
		data: {},
		form: null,
		state: {}
	})
}));

describe('Admin Layout Component', () => {
	const mockAdminData = {
		locale: 'es',
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
		render(AdminLayout, { data: mockAdminData, children: (() => {}) as any });

		const heading = page.getByRole('heading', { name: /Panel de Administración/i });
		await expect.element(heading).toBeInTheDocument();
	});

	it('should render General Config tab', async () => {
		render(AdminLayout, { data: mockAdminData, children: (() => {}) as any });

		const configTab = page.getByRole('link', { name: /Configuración General/i });

		await expect.element(configTab).toBeInTheDocument();
	});

	it('should have correct href attribute for General Config tab', async () => {
		render(AdminLayout, { data: mockAdminData, children: (() => {}) as any });

		const configTab = page.getByRole('link', { name: /Configuración General/i });
		await expect.element(configTab).toHaveAttribute('href', '/admin');
	});
});

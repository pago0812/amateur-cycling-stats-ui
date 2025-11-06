/**
 * Unit Tests: Header Component
 *
 * Tests the main navigation header component.
 */

import { page } from '@vitest/browser/context';
import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Header from './Header.svelte';
import type { UserWithRelations } from '$lib/types/domain';

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

describe('Header Component', () => {
	it('should render logo', async () => {
		render(Header, { props: { user: null } });

		const logo = page.getByText('ACS');
		await expect.element(logo).toBeInTheDocument();
	});

	it('should show login link when user is not authenticated', async () => {
		render(Header, { props: { user: null } });

		const loginLink = page.getByText('common.navigation.login');
		await expect.element(loginLink).toBeInTheDocument();
	});

	it('should show account link when user is authenticated', async () => {
		const mockUser: UserWithRelations = {
			id: 'user-123',
			username: 'testuser',
			roleId: 'role-cyclist',
			createdAt: '2024-01-01T00:00:00Z',
			updatedAt: '2024-01-01T00:00:00Z',
			role: {
				id: 'role-cyclist',
				name: 'CYCLIST',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			},
			cyclist: null,
			organizer: null
		};

		render(Header, { props: { user: mockUser } });

		const accountLink = page.getByText('common.navigation.account');
		await expect.element(accountLink).toBeInTheDocument();
	});

	it('should render mobile menu button', async () => {
		render(Header, { props: { user: null } });

		const mobileButton = page.getByRole('button');
		await expect.element(mobileButton).toBeInTheDocument();
	});
});

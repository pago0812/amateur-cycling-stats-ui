/**
 * Unit Tests: Header Component
 *
 * Tests the main navigation header component.
 */

import { page } from '@vitest/browser/context';
import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Header from './Header.svelte';
import type { Cyclist } from '$lib/types/domain';
import { RoleTypeEnum } from '$lib/types/domain';

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
		render(Header, { user: null });

		const logo = page.getByText('ACS');
		await expect.element(logo).toBeInTheDocument();
	});

	it('should show login link when user is not authenticated', async () => {
		render(Header, { user: null });

		const loginLink = page.getByText('common.navigation.login');
		await expect.element(loginLink).toBeInTheDocument();
	});

	it('should show account link when user is authenticated', async () => {
		const mockUser: Cyclist = {
			id: 'user-123',
			firstName: 'Test',
			lastName: 'User',
			email: 'test@example.com',
			displayName: null,
			hasAuth: true,
			roleType: RoleTypeEnum.CYCLIST,
			gender: null,
			bornYear: 1990,
			createdAt: '2024-01-01T00:00:00Z',
			updatedAt: '2024-01-01T00:00:00Z'
		};

		render(Header, { user: mockUser });

		const accountLink = page.getByText('common.navigation.account');
		await expect.element(accountLink).toBeInTheDocument();
	});

	it('should render mobile menu button', async () => {
		render(Header, { user: null });

		const mobileButton = page.getByRole('button', { name: 'common.navigation.openMenu' });
		await expect.element(mobileButton).toBeInTheDocument();
	});
});

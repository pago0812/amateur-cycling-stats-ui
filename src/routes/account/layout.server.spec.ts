/**
 * Unit Tests: Account Layout Server
 *
 * Tests server-side logic for account layout (authentication and role checks).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { redirect } from '@sveltejs/kit';
import { load } from './+layout.server';
import { RoleTypeEnum } from '$lib/types/domain';

// Mock @sveltejs/kit
vi.mock('@sveltejs/kit', () => ({
	redirect: vi.fn((status: number, location: string) => {
		throw { status, location };
	})
}));

describe('Account Layout Server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should redirect to /login if not authenticated', async () => {
		const mockParent = vi.fn().mockResolvedValue({ user: null });

		try {
			await load({ parent: mockParent } as any);
			expect.fail('Should have thrown redirect');
		} catch (error: any) {
			expect(error.status).toBe(302);
			expect(error.location).toBe('/login');
		}
	});

	it('should redirect organizers to /panel', async () => {
		const mockParent = vi.fn().mockResolvedValue({
			user: {
				id: 'user-1',
				firstName: 'Organizer',
				lastName: 'Owner',
				email: 'organizer@example.com',
				roleType: RoleTypeEnum.ORGANIZER_OWNER
			}
		});

		try {
			await load({ parent: mockParent } as any);
			expect.fail('Should have thrown redirect');
		} catch (error: any) {
			expect(error.status).toBe(302);
			expect(error.location).toBe('/panel');
		}
	});

	it('should redirect admins to /panel', async () => {
		const mockParent = vi.fn().mockResolvedValue({
			user: {
				id: 'user-admin',
				firstName: 'Admin',
				lastName: 'User',
				email: 'admin@example.com',
				roleType: RoleTypeEnum.ADMIN
			}
		});

		try {
			await load({ parent: mockParent } as any);
			expect.fail('Should have thrown redirect');
		} catch (error: any) {
			expect(error.status).toBe(302);
			expect(error.location).toBe('/panel');
		}
	});

	it('should allow cyclists to access', async () => {
		const mockParent = vi.fn().mockResolvedValue({
			user: {
				id: 'user-cyclist',
				firstName: 'Cyclist',
				lastName: 'One',
				email: 'cyclist1@example.com',
				roleType: RoleTypeEnum.CYCLIST
			}
		});

		const result = await load({ parent: mockParent } as any);

		expect(result).toBeDefined();
		expect(result?.user).toBeDefined();
		expect(result?.user?.roleType).toBe(RoleTypeEnum.CYCLIST);
	});
});

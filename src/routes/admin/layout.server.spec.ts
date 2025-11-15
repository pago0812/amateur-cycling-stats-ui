/**
 * Unit Tests: Admin Layout Server
 *
 * Tests server-side logic for admin layout (authentication and role checks).
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

describe('Admin Layout Server', () => {
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

	it('should redirect cyclists to /account', async () => {
		const mockParent = vi.fn().mockResolvedValue({
			user: {
				id: 'user-cyclist',
				firstName: 'Cyclist',
				lastName: 'One',
				email: 'cyclist1@example.com',
				roleType: RoleTypeEnum.CYCLIST
			}
		});

		try {
			await load({ parent: mockParent } as any);
			expect.fail('Should have thrown redirect');
		} catch (error: any) {
			expect(error.status).toBe(302);
			expect(error.location).toBe('/account');
		}
	});

	it('should redirect organizer staff to /panel', async () => {
		const mockParent = vi.fn().mockResolvedValue({
			user: {
				id: 'user-staff',
				firstName: 'Staff',
				lastName: 'User',
				email: 'staff@example.com',
				roleType: RoleTypeEnum.ORGANIZER_STAFF
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

	it('should redirect organizer admins to /panel', async () => {
		const mockParent = vi.fn().mockResolvedValue({
			user: {
				id: 'user-organizer',
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

	it('should allow admins to access', async () => {
		const mockParent = vi.fn().mockResolvedValue({
			user: {
				id: 'user-admin',
				firstName: 'Admin',
				lastName: 'User',
				email: 'admin@example.com',
				roleType: RoleTypeEnum.ADMIN
			}
		});

		const result = await load({ parent: mockParent } as any);

		expect(result).toBeDefined();
		expect(result?.user).toBeDefined();
		expect(result?.user?.roleType).toBe(RoleTypeEnum.ADMIN);
	});
});

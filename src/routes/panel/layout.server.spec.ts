/**
 * Unit Tests: Panel Layout Server
 *
 * Tests server-side logic for panel layout (authentication and role checks).
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

describe('Panel Layout Server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should redirect to /login if not authenticated', async () => {
		const mockLocals = {
			safeGetSession: vi.fn().mockResolvedValue({ user: null })
		};

		try {
			await load({ locals: mockLocals } as any);
			expect.fail('Should have thrown redirect');
		} catch (error: any) {
			expect(error.status).toBe(302);
			expect(error.location).toBe('/login');
		}
	});

	it('should redirect cyclists to /account', async () => {
		const mockLocals = {
			safeGetSession: vi.fn().mockResolvedValue({
				user: {
					id: 'user-cyclist',
					username: 'cyclist1',
					role: { name: RoleTypeEnum.CYCLIST }
				}
			})
		};

		try {
			await load({ locals: mockLocals } as any);
			expect.fail('Should have thrown redirect');
		} catch (error: any) {
			expect(error.status).toBe(302);
			expect(error.location).toBe('/account');
		}
	});

	it('should allow organizer staff to access', async () => {
		const mockLocals = {
			safeGetSession: vi.fn().mockResolvedValue({
				user: {
					id: 'user-staff',
					username: 'staff',
					role: { name: RoleTypeEnum.ORGANIZER_STAFF }
				}
			})
		};

		const result = await load({ locals: mockLocals } as any);

		expect(result.user).toBeDefined();
		expect(result.user.role.name).toBe(RoleTypeEnum.ORGANIZER_STAFF);
	});

	it('should allow organizer admins to access', async () => {
		const mockLocals = {
			safeGetSession: vi.fn().mockResolvedValue({
				user: {
					id: 'user-organizer',
					username: 'organizer',
					role: { name: RoleTypeEnum.ORGANIZER_ADMIN }
				}
			})
		};

		const result = await load({ locals: mockLocals } as any);

		expect(result.user).toBeDefined();
		expect(result.user.role.name).toBe(RoleTypeEnum.ORGANIZER_ADMIN);
	});

	it('should allow admins to access', async () => {
		const mockLocals = {
			safeGetSession: vi.fn().mockResolvedValue({
				user: {
					id: 'user-admin',
					username: 'admin',
					role: { name: RoleTypeEnum.ADMIN }
				}
			})
		};

		const result = await load({ locals: mockLocals } as any);

		expect(result.user).toBeDefined();
		expect(result.user.role.name).toBe(RoleTypeEnum.ADMIN);
	});
});

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

	it('should redirect organizers to /panel', async () => {
		const mockLocals = {
			safeGetSession: vi.fn().mockResolvedValue({
				user: {
					id: 'user-1',
					username: 'organizer',
					role: { name: RoleTypeEnum.ORGANIZER_ADMIN }
				}
			})
		};

		try {
			await load({ locals: mockLocals } as any);
			expect.fail('Should have thrown redirect');
		} catch (error: any) {
			expect(error.status).toBe(302);
			expect(error.location).toBe('/panel');
		}
	});

	it('should redirect admins to /panel', async () => {
		const mockLocals = {
			safeGetSession: vi.fn().mockResolvedValue({
				user: {
					id: 'user-admin',
					username: 'admin',
					role: { name: RoleTypeEnum.ADMIN }
				}
			})
		};

		try {
			await load({ locals: mockLocals } as any);
			expect.fail('Should have thrown redirect');
		} catch (error: any) {
			expect(error.status).toBe(302);
			expect(error.location).toBe('/panel');
		}
	});

	it('should allow cyclists to access', async () => {
		const mockLocals = {
			safeGetSession: vi.fn().mockResolvedValue({
				user: {
					id: 'user-cyclist',
					username: 'cyclist1',
					role: { name: RoleTypeEnum.CYCLIST }
				}
			})
		};

		const result = await load({ locals: mockLocals } as any);

		expect(result.user).toBeDefined();
		expect(result.user.role.name).toBe(RoleTypeEnum.CYCLIST);
	});
});

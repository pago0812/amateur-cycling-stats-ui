/**
 * Unit Tests: Users Adapter
 *
 * Tests transformation of user data from RPC response to domain format.
 */

import { describe, it, expect } from 'vitest';
import { adaptUserWithRelationsFromRpc } from './users.adapter';
import type { UserWithRelationsRpcResponse } from '$lib/types/db';

describe('Users Adapter', () => {
	describe('adaptUserWithRelationsFromRpc', () => {
		it('should transform user with cyclist profile', () => {
			const rpcResponse: UserWithRelationsRpcResponse = {
				id: 'user-123',
				username: 'cyclist1@example.com',
				role_id: 'role-cyclist',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-02T00:00:00Z',
				role: {
					id: 'role-cyclist',
					name: 'CYCLIST',
					type: 2,
					description: 'Cyclist role',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				},
				cyclist: {
					id: 'cyclist-123',
					user_id: 'user-123',
					name: 'Carlos',
					last_name: 'Rodríguez',
					born_year: 1995,
					gender_id: 'gender-male',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-02T00:00:00Z'
				},
				organizer: null
			};

			const result = adaptUserWithRelationsFromRpc(rpcResponse);

			expect(result.id).toBe('user-123');
			expect(result.username).toBe('cyclist1@example.com');
			expect(result.roleId).toBe('role-cyclist');
			expect(result.role.name).toBe('CYCLIST');
			expect(result.cyclist?.name).toBe('Carlos');
			expect(result.cyclist?.lastName).toBe('Rodríguez');
			expect(result.cyclist?.bornYear).toBe(1995);
			expect(result.organizer).toBeUndefined();
		});

		it('should transform user with organizer profile', () => {
			const rpcResponse: UserWithRelationsRpcResponse = {
				id: 'user-456',
				username: 'organizer@example.com',
				role_id: 'role-organizer-admin',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
				role: {
					id: 'role-organizer-admin',
					name: 'ORGANIZER_ADMIN',
					type: 3,
					description: 'Organizer admin role',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				},
				cyclist: null,
				organizer: {
					id: 'organizer-1',
					user_id: 'user-456',
					organization_id: 'org-1',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z',
					organization: {
						id: 'org-1',
						name: 'Pro Cycling League Spain',
						description: 'Professional cycling organization',
						created_at: '2024-01-01T00:00:00Z',
						updated_at: '2024-01-01T00:00:00Z'
					}
				}
			};

			const result = adaptUserWithRelationsFromRpc(rpcResponse);

			expect(result.id).toBe('user-456');
			expect(result.username).toBe('organizer@example.com');
			expect(result.role.name).toBe('ORGANIZER_ADMIN');
			expect(result.organizer?.organizationId).toBe('org-1');
			expect(result.organizer?.organization.name).toBe('Pro Cycling League Spain');
			expect(result.organizer?.organization.description).toBe('Professional cycling organization');
			expect(result.cyclist).toBeUndefined();
		});

		it('should transform admin user with no cyclist or organizer', () => {
			const rpcResponse: UserWithRelationsRpcResponse = {
				id: 'user-admin',
				username: 'admin@acs.com',
				role_id: 'role-admin',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
				role: {
					id: 'role-admin',
					name: 'ADMIN',
					type: 4,
					description: 'System administrator',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				},
				cyclist: null,
				organizer: null
			};

			const result = adaptUserWithRelationsFromRpc(rpcResponse);

			expect(result.id).toBe('user-admin');
			expect(result.username).toBe('admin@acs.com');
			expect(result.role.name).toBe('ADMIN');
			expect(result.cyclist).toBeUndefined();
			expect(result.organizer).toBeUndefined();
		});

		it('should transform all role types correctly', () => {
			const roles: Array<{ name: string; type: number }> = [
				{ name: 'PUBLIC', type: 1 },
				{ name: 'CYCLIST', type: 2 },
				{ name: 'ORGANIZER_STAFF', type: 3 },
				{ name: 'ORGANIZER_ADMIN', type: 3 },
				{ name: 'ADMIN', type: 4 }
			];

			roles.forEach((roleData) => {
				const rpcResponse: UserWithRelationsRpcResponse = {
					id: 'user-test',
					username: 'test@example.com',
					role_id: `role-${roleData.name.toLowerCase()}`,
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z',
					role: {
						id: `role-${roleData.name.toLowerCase()}`,
						name: roleData.name,
						type: roleData.type,
						description: `${roleData.name} role`,
						created_at: '2024-01-01T00:00:00Z',
						updated_at: '2024-01-01T00:00:00Z'
					},
					cyclist: null,
					organizer: null
				};

				const result = adaptUserWithRelationsFromRpc(rpcResponse);

				expect(result.role.name).toBe(roleData.name);
				expect(result.role.type).toBe(roleData.type);
			});
		});

		it('should preserve timestamps correctly', () => {
			const rpcResponse: UserWithRelationsRpcResponse = {
				id: 'user-123',
				username: 'test@example.com',
				role_id: 'role-public',
				created_at: '2024-01-15T10:30:00Z',
				updated_at: '2024-02-20T14:45:00Z',
				role: {
					id: 'role-public',
					name: 'PUBLIC',
					type: 1,
					description: 'Public role',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				},
				cyclist: null,
				organizer: null
			};

			const result = adaptUserWithRelationsFromRpc(rpcResponse);

			expect(result.createdAt).toBe('2024-01-15T10:30:00Z');
			expect(result.updatedAt).toBe('2024-02-20T14:45:00Z');
		});

		it('should handle cyclist with null optional fields', () => {
			const rpcResponse: UserWithRelationsRpcResponse = {
				id: 'user-123',
				username: 'newcyclist@example.com',
				role_id: 'role-cyclist',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
				role: {
					id: 'role-cyclist',
					name: 'CYCLIST',
					type: 2,
					description: 'Cyclist role',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				},
				cyclist: {
					id: 'cyclist-new',
					user_id: 'user-123',
					name: '',
					last_name: '',
					born_year: null,
					gender_id: null,
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				},
				organizer: null
			};

			const result = adaptUserWithRelationsFromRpc(rpcResponse);

			expect(result.cyclist?.bornYear).toBeNull();
			expect(result.cyclist?.genderId).toBeNull();
			expect(result.cyclist?.name).toBe('');
			expect(result.cyclist?.lastName).toBe('');
		});
	});
});

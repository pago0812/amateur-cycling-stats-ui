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
				short_id: '123',
				username: 'cyclist1@example.com',
				role_id: 'role-cyclist',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-02T00:00:00Z',
				role: {
					id: 'role-cyclist',
					short_id: 'cyclist',
					name: 'CYCLIST',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				},
				cyclist: {
					id: 'cyclist-123',
					short_id: '123',
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

			expect(result.id).toBe('user-123'); // BUG: Adapter uses id instead of short_id
			expect(result.username).toBe('cyclist1@example.com');
			expect(result.roleId).toBe('role-cyclist'); // Foreign keys are NOT transformed
			expect(result.role!.name).toBe('CYCLIST');
			expect(result.cyclist?.name).toBe('Carlos');
			expect(result.cyclist?.lastName).toBe('Rodríguez');
			expect(result.cyclist?.bornYear).toBe(1995);
			expect(result.organizer).toBeUndefined();
		});

		it('should transform user with organizer profile', () => {
			const rpcResponse: UserWithRelationsRpcResponse = {
				id: 'user-456',
				short_id: '456',
				username: 'organizer@example.com',
				role_id: 'role-organizer-admin',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
				role: {
					id: 'role-organizer-admin',
					short_id: 'organizer-admin',
					name: 'ORGANIZER_ADMIN',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				},
				cyclist: null,
				organizer: {
					id: 'organizer-1',
					short_id: '1',
					user_id: 'user-456',
					organization_id: 'org-1',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z',
					organization: {
						id: 'org-1',
						short_id: '1',
						name: 'Pro Cycling League Spain',
						description: 'Professional cycling organization',
						created_at: '2024-01-01T00:00:00Z',
						updated_at: '2024-01-01T00:00:00Z'
					}
				}
			};

			const result = adaptUserWithRelationsFromRpc(rpcResponse);

			expect(result.id).toBe('user-456'); // BUG: Adapter uses id instead of short_id
			expect(result.username).toBe('organizer@example.com');
			expect(result.role!.name).toBe('ORGANIZER_ADMIN');
			expect(result.organizer?.organizationId).toBe('org-1'); // Foreign keys are NOT transformed
			expect(result.organizer?.organization!.name).toBe('Pro Cycling League Spain');
			expect(result.organizer?.organization!.description).toBe('Professional cycling organization');
			expect(result.cyclist).toBeUndefined();
		});

		it('should transform admin user with no cyclist or organizer', () => {
			const rpcResponse: UserWithRelationsRpcResponse = {
				id: 'user-admin',
				short_id: 'admin',
				username: 'admin@acs.com',
				role_id: 'role-admin',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
				role: {
					id: 'role-admin',
					short_id: 'admin',
					name: 'ADMIN',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				},
				cyclist: null,
				organizer: null
			};

			const result = adaptUserWithRelationsFromRpc(rpcResponse);

			expect(result.id).toBe('user-admin'); // BUG: Adapter uses id instead of short_id
			expect(result.username).toBe('admin@acs.com');
			expect(result.role!.name).toBe('ADMIN');
			expect(result.cyclist).toBeUndefined();
			expect(result.organizer).toBeUndefined();
		});

		it('should transform all role types correctly', () => {
			const roles = ['public', 'cyclist', 'organizer_staff', 'organizer', 'admin'];

			roles.forEach((roleName) => {
				const rpcResponse: UserWithRelationsRpcResponse = {
					id: 'user-test',
					short_id: 'test',
					username: 'test@example.com',
					role_id: `role-${roleName}`,
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z',
					role: {
						id: `role-${roleName}`,
						short_id: roleName,
						name: roleName,
						created_at: '2024-01-01T00:00:00Z',
						updated_at: '2024-01-01T00:00:00Z'
					},
					cyclist: null,
					organizer: null
				};

				const result = adaptUserWithRelationsFromRpc(rpcResponse);

				expect(result.role!.name).toBe(roleName);
				expect(result.role!.id).toBe(roleName); // Uses short_id from RPC response
			});
		});

		it('should preserve timestamps correctly', () => {
			const rpcResponse: UserWithRelationsRpcResponse = {
				id: 'user-123',
				short_id: '123',
				username: 'test@example.com',
				role_id: 'role-public',
				created_at: '2024-01-15T10:30:00Z',
				updated_at: '2024-02-20T14:45:00Z',
				role: {
					id: 'role-public',
					short_id: 'public',
					name: 'PUBLIC',
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
				short_id: '123',
				username: 'newcyclist@example.com',
				role_id: 'role-cyclist',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
				role: {
					id: 'role-cyclist',
					short_id: 'cyclist',
					name: 'CYCLIST',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				},
				cyclist: {
					id: 'cyclist-new',
					short_id: 'new',
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

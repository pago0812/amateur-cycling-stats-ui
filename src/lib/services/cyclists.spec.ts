/**
 * Unit Tests: Cyclists Service
 *
 * Tests cyclist service functions that interact with Supabase.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCyclistWithResultsById, createCyclist } from './cyclists';
import {
	createMockSupabaseClient,
	mockSupabaseRPC,
	mockSupabaseQuery,
	createMockDbRow
} from '$lib/test-utils/supabase-mock';
import type { CyclistWithResultsRpcResponse, CyclistDB } from '$lib/types/db';

describe('Cyclists Service', () => {
	let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

	beforeEach(() => {
		mockSupabase = createMockSupabaseClient();
		vi.clearAllMocks();
	});

	describe('getCyclistWithResultsById', () => {
		it('should fetch cyclist with nested race results via RPC', async () => {
			const mockRpcResponse: CyclistWithResultsRpcResponse = {
				id: 'cyclist-123',
				name: 'Carlos',
				last_name: 'Rodríguez',
				born_year: 1995,
				gender_id: 'gender-male',
				user_id: 'user-123',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
				gender: {
					id: 'gender-male',
					name: 'M',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				},
				race_results: [
					{
						id: 'result-1',
						place: 1,
						time: '02:30:45',
						race_id: 'race-1',
						cyclist_id: 'cyclist-123',
						ranking_point_id: 'rp-1',
						created_at: '2024-01-01T00:00:00Z',
						updated_at: '2024-01-01T00:00:00Z',
						race: {
							id: 'race-1',
							name: 'Gran Fondo - LONG/MALE/ABS',
							description: 'Long distance',
							date_time: '2024-06-15T09:00:00Z',
							is_public_visible: true,
							event_id: 'event-1',
							race_category_id: 'cat-abs',
							race_category_gender_id: 'gender-male',
							race_category_length_id: 'length-long',
							race_ranking_id: 'ranking-uci',
							created_at: '2024-01-01T00:00:00Z',
							updated_at: '2024-01-01T00:00:00Z',
							event: {
								id: 'event-1',
								name: 'Gran Fondo Valencia',
								description: 'Annual event',
								date_time: '2024-06-15T09:00:00Z',
								year: 2024,
								city: 'Valencia',
								state: 'Valencia',
								country: 'Spain',
								event_status: 'FINISHED',
								is_public_visible: true,
								organization_id: 'org-1',
								created_by: 'user-1',
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							},
							race_category: {
								id: 'cat-abs',
								name: 'ABS',
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							},
							race_category_gender: {
								id: 'gender-male',
								name: 'MALE',
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							},
							race_category_length: {
								id: 'length-long',
								name: 'LONG',
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							},
							race_ranking: {
								id: 'ranking-uci',
								name: 'UCI',
								description: 'UCI ranking',
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							}
						},
						ranking_point: {
							id: 'rp-1',
							place: 1,
							points: 100,
							race_ranking_id: 'ranking-uci',
							created_at: '2024-01-01T00:00:00Z',
							updated_at: '2024-01-01T00:00:00Z'
						}
					}
				]
			};

			mockSupabaseRPC(mockSupabase, 'get_cyclist_with_results', {
				data: mockRpcResponse,
				error: null
			});

			const result = await getCyclistWithResultsById(mockSupabase, { id: 'cyclist-123' });

			expect(result.id).toBe('cyclist-123');
			expect(result.name).toBe('Carlos');
			expect(result.lastName).toBe('Rodríguez');
			expect(result.raceResults).toHaveLength(1);
			expect(result.raceResults[0].place).toBe(1);
			expect(result.raceResults[0].race.name).toBe('Gran Fondo - LONG/MALE/ABS');
			expect(mockSupabase.rpc).toHaveBeenCalledWith('get_cyclist_with_results', {
				cyclist_uuid: 'cyclist-123'
			});
		});

		it('should throw error on database failure', async () => {
			mockSupabaseRPC(mockSupabase, 'get_cyclist_with_results', {
				data: null,
				error: { message: 'RPC function failed' }
			});

			await expect(
				getCyclistWithResultsById(mockSupabase, { id: 'cyclist-123' })
			).rejects.toThrow('Error fetching cyclist: RPC function failed');
		});

		it('should throw error when cyclist not found', async () => {
			mockSupabaseRPC(mockSupabase, 'get_cyclist_with_results', {
				data: null,
				error: null
			});

			await expect(
				getCyclistWithResultsById(mockSupabase, { id: 'nonexistent' })
			).rejects.toThrow('Cyclist not found');
		});

		it('should transform RPC response to domain types with camelCase', async () => {
			const mockRpcResponse: CyclistWithResultsRpcResponse = {
				id: 'cyclist-123',
				name: 'Test',
				last_name: 'Cyclist',
				born_year: 1995,
				gender_id: null,
				user_id: null,
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
				gender: null,
				race_results: []
			};

			mockSupabaseRPC(mockSupabase, 'get_cyclist_with_results', {
				data: mockRpcResponse,
				error: null
			});

			const result = await getCyclistWithResultsById(mockSupabase, { id: 'cyclist-123' });

			// Verify camelCase transformation
			expect(result).toHaveProperty('lastName');
			expect(result).toHaveProperty('bornYear');
			expect(result).toHaveProperty('genderId');
			expect(result).toHaveProperty('userId');
			expect(result).toHaveProperty('createdAt');
			expect(result).toHaveProperty('updatedAt');
			expect(result).not.toHaveProperty('last_name');
			expect(result).not.toHaveProperty('born_year');
		});
	});

	describe('createCyclist', () => {
		it('should create cyclist with all fields', async () => {
			const newCyclist = {
				name: 'María',
				lastName: 'García',
				bornYear: 1998,
				genderId: 'gender-female',
				userId: 'user-456'
			};

			const mockCreatedCyclist: CyclistDB = createMockDbRow({
				id: 'cyclist-new',
				name: 'María',
				last_name: 'García',
				born_year: 1998,
				gender_id: 'gender-female',
				user_id: 'user-456'
			});

			const queryMock = mockSupabaseQuery(mockSupabase, {
				data: mockCreatedCyclist,
				error: null
			});
			queryMock.insert.mockReturnThis();
			queryMock.select.mockReturnThis();
			queryMock.single.mockResolvedValue({ data: mockCreatedCyclist, error: null });

			const result = await createCyclist(mockSupabase, newCyclist);

			expect(result.id).toBe('cyclist-new');
			expect(result.name).toBe('María');
			expect(result.lastName).toBe('García');
			expect(result.bornYear).toBe(1998);
			expect(result.genderId).toBe('gender-female');
			expect(result.userId).toBe('user-456');
		});

		it('should create cyclist with minimal fields (null optional fields)', async () => {
			const newCyclist = {
				name: 'Unregistered',
				lastName: 'Athlete'
			};

			const mockCreatedCyclist: CyclistDB = createMockDbRow({
				id: 'cyclist-minimal',
				name: 'Unregistered',
				last_name: 'Athlete',
				born_year: null,
				gender_id: null,
				user_id: null
			});

			const queryMock = mockSupabaseQuery(mockSupabase, {
				data: mockCreatedCyclist,
				error: null
			});
			queryMock.insert.mockReturnThis();
			queryMock.select.mockReturnThis();
			queryMock.single.mockResolvedValue({ data: mockCreatedCyclist, error: null });

			const result = await createCyclist(mockSupabase, newCyclist);

			expect(result.name).toBe('Unregistered');
			expect(result.lastName).toBe('Athlete');
			expect(result.bornYear).toBeNull();
			expect(result.genderId).toBeNull();
			expect(result.userId).toBeNull();
		});

		it('should throw error on database failure', async () => {
			const queryMock = mockSupabaseQuery(mockSupabase, {
				data: null,
				error: { message: 'Unique constraint violation' }
			});
			queryMock.insert.mockReturnThis();
			queryMock.select.mockReturnThis();
			queryMock.single.mockResolvedValue({
				data: null,
				error: { message: 'Unique constraint violation' }
			});

			await expect(
				createCyclist(mockSupabase, { name: 'Test', lastName: 'Cyclist' })
			).rejects.toThrow('Error creating cyclist: Unique constraint violation');
		});

		it('should throw error when data is null despite no error', async () => {
			const queryMock = mockSupabaseQuery(mockSupabase, {
				data: null,
				error: null
			});
			queryMock.insert.mockReturnThis();
			queryMock.select.mockReturnThis();
			queryMock.single.mockResolvedValue({ data: null, error: null });

			await expect(
				createCyclist(mockSupabase, { name: 'Test', lastName: 'Cyclist' })
			).rejects.toThrow('Failed to create cyclist');
		});

		it('should transform DB response to domain type with camelCase', async () => {
			const mockCreatedCyclist: CyclistDB = createMockDbRow({
				id: 'cyclist-test',
				name: 'Test',
				last_name: 'Cyclist',
				born_year: 1990,
				gender_id: 'gender-male',
				user_id: 'user-123'
			});

			const queryMock = mockSupabaseQuery(mockSupabase, {
				data: mockCreatedCyclist,
				error: null
			});
			queryMock.insert.mockReturnThis();
			queryMock.select.mockReturnThis();
			queryMock.single.mockResolvedValue({ data: mockCreatedCyclist, error: null });

			const result = await createCyclist(mockSupabase, {
				name: 'Test',
				lastName: 'Cyclist',
				bornYear: 1990,
				genderId: 'gender-male',
				userId: 'user-123'
			});

			// Verify camelCase transformation
			expect(result).toHaveProperty('lastName');
			expect(result).toHaveProperty('bornYear');
			expect(result).toHaveProperty('genderId');
			expect(result).toHaveProperty('userId');
			expect(result).not.toHaveProperty('last_name');
			expect(result).not.toHaveProperty('born_year');
		});
	});
});

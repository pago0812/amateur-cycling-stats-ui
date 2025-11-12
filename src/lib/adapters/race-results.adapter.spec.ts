/**
 * Unit Tests: Race Results Adapter
 *
 * Tests transformation of race result data from DB format to domain format.
 */

import { describe, it, expect } from 'vitest';
import { adaptRaceResultFromDb, adaptRaceResultWithRelationsFromDb } from './race-results.adapter';
import type { RaceResultDB, RaceResultWithRelationsResponse } from '$lib/types/db';

describe('Race Results Adapter', () => {
	describe('adaptRaceResultFromDb', () => {
		it('should transform DB race result to domain RaceResult', () => {
			const dbResult: RaceResultDB = {
				id: 'result-123',
				short_id: '123',
				place: 1,
				time: '02:30:45',
				race_id: 'race-123',
				cyclist_id: 'cyclist-123',
				ranking_point_id: 'rp-123',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			};

			const result = adaptRaceResultFromDb(dbResult);

			expect(result).toEqual({
				id: '123', // short_id extracted from 'result-123'
				place: 1,
				time: '02:30:45',
				points: null, // Not in base table
				raceId: 'race-123', // Foreign keys are NOT transformed
				cyclistId: 'cyclist-123', // Foreign keys are NOT transformed
				rankingPointId: 'rp-123', // Foreign keys are NOT transformed
				createdAt: expect.any(String),
				updatedAt: expect.any(String)
			});
		});

		it('should handle null time', () => {
			const dbResult: RaceResultDB = {
				id: 'result-123',
				short_id: '123',
				place: 1,
				time: null,
				race_id: 'race-123',
				cyclist_id: 'cyclist-123',
				ranking_point_id: null,
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			};

			const result = adaptRaceResultFromDb(dbResult);

			expect(result.time).toBeNull();
			expect(result.rankingPointId).toBeNull();
		});

		it('should set points to null for base race result', () => {
			const dbResult: RaceResultDB = {
				id: 'result-123',
				short_id: '123',
				place: 1,
				time: '02:30:45',
				race_id: 'race-123',
				cyclist_id: 'cyclist-123',
				ranking_point_id: 'rp-123',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			};

			const result = adaptRaceResultFromDb(dbResult);

			// Points are not in the base table, only in relations
			expect(result.points).toBeNull();
		});
	});

	describe('adaptRaceResultWithRelationsFromDb', () => {
		it('should transform race result with cyclist and ranking point', () => {
			const dbResult: RaceResultWithRelationsResponse = {
				id: 'result-123',
				short_id: '123',
				place: 1,
				time: '02:30:45',
				points: 100,
				race_id: 'race-123',
				cyclist_id: 'cyclist-123',
				ranking_point_id: 'rp-123',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
				cyclists: {
					id: 'cyclist-123',
					short_id: '123',
					born_year: 1995,
					gender_id: 'gender-male',
					user_id: 'user-123',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z',
					users: {
						id: 'user-123',
						short_id: 'u123',
						first_name: 'Carlos',
						last_name: 'Rodríguez',
						role_id: 'role-cyclist',
						auth_user_id: null,
						created_at: '2024-01-01T00:00:00Z',
						updated_at: '2024-01-01T00:00:00Z'
					}
				},
				ranking_points: {
					id: 'rp-123',
					short_id: '123',
					place: 1,
					points: 100,
					race_ranking_id: 'ranking-uci',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				}
			};

			const result = adaptRaceResultWithRelationsFromDb(dbResult);

			expect(result.id).toBe('123'); // short_id extracted from 'result-123'
			expect(result.place).toBe(1);
			expect(result.time).toBe('02:30:45');
			expect(result.points).toBe(100);
			expect(result.cyclist!.user?.firstName).toBe('Carlos');
			expect(result.cyclist!.user?.lastName).toBe('Rodríguez');
			expect(result.rankingPoint?.points).toBe(100);
			expect(result.rankingPoint?.place).toBe(1);
		});

		it('should handle null ranking_points', () => {
			const dbResult: RaceResultWithRelationsResponse = {
				id: 'result-123',
				short_id: '123',
				place: 1,
				time: '02:30:45',
				points: null,
				race_id: 'race-123',
				cyclist_id: 'cyclist-123',
				ranking_point_id: null,
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
				cyclists: {
					id: 'cyclist-123',
					short_id: '123',
					born_year: 1995,
					gender_id: 'gender-1',
					user_id: 'user-123',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z',
					users: {
						id: 'user-123',
						short_id: 'u123',
						first_name: 'Test',
						last_name: 'Cyclist',
						role_id: 'role-cyclist',
						auth_user_id: null,
						created_at: '2024-01-01T00:00:00Z',
						updated_at: '2024-01-01T00:00:00Z'
					}
				},
				ranking_points: null
			};

			const result = adaptRaceResultWithRelationsFromDb(dbResult);

			expect(result.rankingPoint).toBeUndefined();
			expect(result.points).toBeNull();
		});

		it('should transform cyclist with all fields', () => {
			const dbResult: RaceResultWithRelationsResponse = {
				id: 'result-123',
				short_id: '123',
				place: 1,
				time: '02:30:45',
				points: 50,
				race_id: 'race-123',
				cyclist_id: 'cyclist-123',
				ranking_point_id: 'rp-123',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
				cyclists: {
					id: 'cyclist-123',
					short_id: '123',
					born_year: 1998,
					gender_id: 'gender-female',
					user_id: 'user-456',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-02T00:00:00Z',
					users: {
						id: 'user-456',
						short_id: 'u456',
						first_name: 'María',
						last_name: 'García',
						role_id: 'role-cyclist',
						auth_user_id: null,
						created_at: '2024-01-01T00:00:00Z',
						updated_at: '2024-01-02T00:00:00Z'
					}
				},
				ranking_points: {
					id: 'rp-123',
					short_id: '123',
					place: 2,
					points: 50,
					race_ranking_id: 'ranking-national',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				}
			};

			const result = adaptRaceResultWithRelationsFromDb(dbResult);

			expect(result.cyclist).toMatchObject({
				id: '123', // short_id extracted
				bornYear: 1998,
				genderId: 'gender-female',
				userId: 'user-456',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-02T00:00:00Z'
			});
			expect(result.cyclist!.user?.firstName).toBe('María');
			expect(result.cyclist!.user?.lastName).toBe('García');
		});

		it('should transform ranking point with all fields', () => {
			const dbResult: RaceResultWithRelationsResponse = {
				id: 'result-123',
				short_id: '123',
				place: 3,
				time: '02:45:30',
				points: 30,
				race_id: 'race-123',
				cyclist_id: 'cyclist-123',
				ranking_point_id: 'rp-123',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
				cyclists: {
					id: 'cyclist-123',
					short_id: '123',
					born_year: 1995,
					gender_id: 'gender-1',
					user_id: 'user-123',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z',
					users: {
						id: 'user-123',
						short_id: 'u123',
						first_name: 'Test',
						last_name: 'Cyclist',
						role_id: 'role-cyclist',
						auth_user_id: null,
						created_at: '2024-01-01T00:00:00Z',
						updated_at: '2024-01-01T00:00:00Z'
					}
				},
				ranking_points: {
					id: 'rp-123',
					short_id: '123',
					place: 3,
					points: 30,
					race_ranking_id: 'ranking-regional',
					created_at: '2024-01-15T00:00:00Z',
					updated_at: '2024-01-16T00:00:00Z'
				}
			};

			const result = adaptRaceResultWithRelationsFromDb(dbResult);

			expect(result.rankingPoint).toEqual({
				id: '123', // short_id extracted from 'rp-123'
				place: 3,
				points: 30,
				raceRankingId: 'ranking-regional', // Foreign keys are NOT transformed
				createdAt: '2024-01-15T00:00:00Z',
				updatedAt: '2024-01-16T00:00:00Z'
			});
		});
	});
});

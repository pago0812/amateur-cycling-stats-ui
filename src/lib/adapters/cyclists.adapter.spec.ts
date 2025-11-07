/**
 * Unit Tests: Cyclists Adapter
 *
 * Tests transformation of cyclist data from DB format to domain format.
 */

import { describe, it, expect } from 'vitest';
import {
	adaptCyclistFromDb,
	adaptCyclistWithResultsFromDb,
	adaptCyclistWithResultsFromRpc
} from './cyclists.adapter';
import type {
	CyclistDB,
	CyclistWithResultsResponse,
	CyclistWithResultsRpcResponse
} from '$lib/types/db';

describe('Cyclists Adapter', () => {
	describe('adaptCyclistFromDb', () => {
		it('should transform DB cyclist to domain Cyclist', () => {
			const dbCyclist: CyclistDB = {
				id: 'cyclist-123',
				short_id: '123',
				name: 'Carlos',
				last_name: 'Rodríguez',
				born_year: 1995,
				gender_id: 'gender-male',
				user_id: 'user-123',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			};

			const result = adaptCyclistFromDb(dbCyclist);

			expect(result).toEqual({
				id: '123', // short_id extracted from 'cyclist-123'
				name: 'Carlos',
				lastName: 'Rodríguez',
				bornYear: 1995,
				genderId: 'gender-male', // Foreign keys are NOT transformed
				userId: 'user-123', // Foreign keys are NOT transformed
				createdAt: expect.any(String),
				updatedAt: expect.any(String)
			});
		});

		it('should handle null optional fields', () => {
			const dbCyclist: CyclistDB = {
				id: 'cyclist-123',
				short_id: '123',
				name: 'Test',
				last_name: 'Cyclist',
				born_year: null,
				gender_id: null,
				user_id: null,
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			};

			const result = adaptCyclistFromDb(dbCyclist);

			expect(result.bornYear).toBeNull();
			expect(result.genderId).toBeNull();
			expect(result.userId).toBeNull();
		});

		it('should handle cyclist without user account', () => {
			const dbCyclist: CyclistDB = {
				id: 'cyclist-unlinked',
				short_id: 'unlinked',
				name: 'Unregistered',
				last_name: 'Athlete',
				born_year: 1990,
				gender_id: 'gender-male',
				user_id: null,
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			};

			const result = adaptCyclistFromDb(dbCyclist);

			expect(result.userId).toBeNull();
			expect(result.name).toBe('Unregistered');
		});
	});

	describe('adaptCyclistWithResultsFromDb', () => {
		it('should transform cyclist with race results and nested relations', () => {
			const dbCyclist: CyclistWithResultsResponse = {
				id: 'cyclist-123',
				short_id: '123',
				name: 'Carlos',
				last_name: 'Rodríguez',
				born_year: 1995,
				gender_id: 'gender-male',
				user_id: 'user-123',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
				gender: {
					id: 'gender-male',
					short_id: 'male',
					name: 'M',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				},
				race_results: [
					{
						id: 'result-1',
						short_id: '1',
						place: 1,
						time: '02:30:45',
						points: 100,
						race_id: 'race-1',
						cyclist_id: 'cyclist-123',
						ranking_point_id: 'rp-1',
						created_at: '2024-01-01T00:00:00Z',
						updated_at: '2024-01-01T00:00:00Z',
						race: {
							id: 'race-1',
							short_id: '1',
							name: 'Gran Fondo - LONG/MALE/ABS',
							description: 'Long distance race',
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
								short_id: '1',
								name: 'Gran Fondo Valencia',
								description: 'Annual event',
								date_time: '2024-06-15T09:00:00Z',
								year: 2024,
								city: 'Valencia',
								state: 'Valencia',
								country: 'Spain',
								event_status: 'AVAILABLE',
								is_public_visible: true,
								organization_id: 'org-1',
								created_by: 'user-1',
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							},
							race_category: {
								id: 'cat-abs',
								short_id: 'abs',
								name: 'ABS',
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							},
							race_category_gender: {
								id: 'gender-male',
								short_id: 'male',
								name: 'MALE',
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							},
							race_category_length: {
								id: 'length-long',
								short_id: 'long',
								name: 'LONG',
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							},
							race_ranking: {
								id: 'ranking-uci',
								short_id: 'uci',
								name: 'UCI',
								description: 'UCI ranking system',
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							}
						},
						ranking_point: {
							id: 'rp-1',
							short_id: '1',
							place: 1,
							points: 100,
							race_ranking_id: 'ranking-uci',
							created_at: '2024-01-01T00:00:00Z',
							updated_at: '2024-01-01T00:00:00Z'
						}
					}
				]
			};

			const result = adaptCyclistWithResultsFromDb(dbCyclist);

			expect(result.id).toBe('123'); // short_id extracted from 'cyclist-123'
			expect(result.name).toBe('Carlos');
			expect(result.lastName).toBe('Rodríguez');
			expect(result.gender?.name).toBe('M');
			expect(result.raceResults).toHaveLength(1);
			expect(result.raceResults![0].place).toBe(1);
			expect(result.raceResults![0]!.race!.name).toBe('Gran Fondo - LONG/MALE/ABS');
			expect(result.raceResults![0]!.race!.event!.name).toBe('Gran Fondo Valencia');
			expect(result.raceResults![0]!.race!.raceCategory!.name).toBe('ABS');
			expect(result.raceResults![0]!.rankingPoint?.points).toBe(100);
		});

		it('should handle cyclist with no gender', () => {
			const dbCyclist: CyclistWithResultsResponse = {
				id: 'cyclist-123',
				short_id: '123',
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

			const result = adaptCyclistWithResultsFromDb(dbCyclist);

			expect(result.gender).toBeUndefined();
		});

		it('should handle empty race results array', () => {
			const dbCyclist: CyclistWithResultsResponse = {
				id: 'cyclist-123',
				short_id: '123',
				name: 'New',
				last_name: 'Cyclist',
				born_year: 2000,
				gender_id: 'gender-female',
				user_id: 'user-456',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
				gender: {
					id: 'gender-female',
					short_id: 'female',
					name: 'F',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				},
				race_results: []
			};

			const result = adaptCyclistWithResultsFromDb(dbCyclist);

			expect(result.raceResults).toEqual([]);
		});
	});

	describe('adaptCyclistWithResultsFromRpc', () => {
		it('should transform RPC response to domain CyclistWithRelations', () => {
			const rpcData: CyclistWithResultsRpcResponse = {
				id: 'uuid-cyclist-123',
				short_id: 'cyclist-123',
				name: 'María',
				last_name: 'García',
				born_year: 1998,
				gender_id: 'gender-female',
				user_id: 'user-456',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-02T00:00:00Z',
				gender: {
					id: 'uuid-gender-female',
					short_id: 'gender-female',
					name: 'F',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				},
				race_results: [
					{
						id: 'uuid-result-1',
						short_id: 'result-1',
						place: 2,
						time: '02:45:30',
						race_id: 'race-1',
						cyclist_id: 'cyclist-123',
						ranking_point_id: 'rp-2',
						created_at: '2024-01-01T00:00:00Z',
						updated_at: '2024-01-01T00:00:00Z',
						race: {
							id: 'uuid-race-1',
							short_id: 'race-1',
							name: 'Women Gran Fondo - LONG/FEMALE/ELITE',
							description: 'Elite women race',
							date_time: '2024-06-15T10:00:00Z',
							is_public_visible: true,
							event_id: 'event-1',
							race_category_id: 'cat-elite',
							race_category_gender_id: 'gender-female',
							race_category_length_id: 'length-long',
							race_ranking_id: 'ranking-national',
							created_at: '2024-01-01T00:00:00Z',
							updated_at: '2024-01-01T00:00:00Z',
							event: {
								id: 'uuid-event-1',
								short_id: 'event-1',
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
								id: 'uuid-cat-elite',
								short_id: 'cat-elite',
								name: 'ELITE',
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							},
							race_category_gender: {
								id: 'uuid-gender-female',
								short_id: 'gender-female',
								name: 'FEMALE',
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							},
							race_category_length: {
								id: 'uuid-length-long',
								short_id: 'length-long',
								name: 'LONG',
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							},
							race_ranking: {
								id: 'uuid-ranking-national',
								short_id: 'ranking-national',
								name: 'NATIONAL',
								description: 'National ranking system',
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							}
						},
						ranking_point: {
							id: 'uuid-rp-2',
							short_id: 'rp-2',
							place: 2,
							points: 50,
							race_ranking_id: 'ranking-national',
							created_at: '2024-01-01T00:00:00Z',
							updated_at: '2024-01-01T00:00:00Z'
						}
					}
				]
			};

			const result = adaptCyclistWithResultsFromRpc(rpcData);

			expect(result.id).toBe('cyclist-123'); // Uses short_id directly from RPC
			expect(result.name).toBe('María');
			expect(result.lastName).toBe('García');
			expect(result.bornYear).toBe(1998);
			expect(result.gender?.name).toBe('F');
			expect(result.raceResults).toHaveLength(1);
			expect(result.raceResults![0].place).toBe(2);
			expect(result.raceResults![0].points).toBe(50); // From ranking_point
			expect(result.raceResults![0]!.race!.event!.eventStatus).toBe('FINISHED');
		});

		it('should handle null ranking_point in RPC response', () => {
			const rpcData: CyclistWithResultsRpcResponse = {
				id: 'cyclist-123',
				short_id: '123',
				name: 'Test',
				last_name: 'Cyclist',
				born_year: 1995,
				gender_id: null,
				user_id: null,
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
				gender: null,
				race_results: [
					{
						id: 'result-1',
						short_id: '1',
						place: 10,
						time: '03:00:00',
						race_id: 'race-1',
						cyclist_id: 'cyclist-123',
						ranking_point_id: null,
						created_at: '2024-01-01T00:00:00Z',
						updated_at: '2024-01-01T00:00:00Z',
						race: {
							id: 'race-1',
							short_id: '1',
							name: 'Test Race',
							description: null,
							date_time: '2024-01-01T10:00:00Z',
							is_public_visible: true,
							event_id: 'event-1',
							race_category_id: 'cat-1',
							race_category_gender_id: 'gender-1',
							race_category_length_id: 'length-1',
							race_ranking_id: 'ranking-1',
							created_at: '2024-01-01T00:00:00Z',
							updated_at: '2024-01-01T00:00:00Z',
							event: {
								id: 'event-1',
								short_id: '1',
								name: 'Event',
								description: null,
								date_time: '2024-01-01T09:00:00Z',
								year: 2024,
								city: 'City',
								state: 'State',
								country: 'Country',
								event_status: 'DRAFT',
								is_public_visible: false,
								organization_id: 'org-1',
								created_by: 'user-1',
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							},
							race_category: {
								id: 'cat-1',
								short_id: '1',
								name: 'CAT1',
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							},
							race_category_gender: {
								id: 'gender-1',
								short_id: '1',
								name: 'OPEN',
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							},
							race_category_length: {
								id: 'length-1',
								short_id: '1',
								name: 'SHORT',
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							},
							race_ranking: {
								id: 'ranking-1',
								short_id: '1',
								name: 'CUSTOM',
								description: null,
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							}
						},
						ranking_point: null
					}
				]
			};

			const result = adaptCyclistWithResultsFromRpc(rpcData);

			expect(result.raceResults![0].points).toBeNull();
			expect(result.raceResults![0].rankingPoint).toBeUndefined();
		});

		it('should copy points from ranking_point when available', () => {
			const rpcData: CyclistWithResultsRpcResponse = {
				id: 'cyclist-123',
				short_id: '123',
				name: 'Test',
				last_name: 'Cyclist',
				born_year: 1995,
				gender_id: 'gender-male',
				user_id: 'user-123',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
				gender: {
					id: 'gender-male',
					short_id: 'male',
					name: 'M',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				},
				race_results: [
					{
						id: 'result-1',
						short_id: '1',
						place: 3,
						time: '02:50:00',
						race_id: 'race-1',
						cyclist_id: 'cyclist-123',
						ranking_point_id: 'rp-3',
						created_at: '2024-01-01T00:00:00Z',
						updated_at: '2024-01-01T00:00:00Z',
						race: {
							id: 'race-1',
							short_id: '1',
							name: 'Race',
							description: null,
							date_time: '2024-01-01T10:00:00Z',
							is_public_visible: true,
							event_id: 'event-1',
							race_category_id: 'cat-1',
							race_category_gender_id: 'gender-1',
							race_category_length_id: 'length-1',
							race_ranking_id: 'ranking-1',
							created_at: '2024-01-01T00:00:00Z',
							updated_at: '2024-01-01T00:00:00Z',
							event: {
								id: 'event-1',
								short_id: '1',
								name: 'Event',
								description: null,
								date_time: '2024-01-01T09:00:00Z',
								year: 2024,
								city: 'City',
								state: 'State',
								country: 'Country',
								event_status: 'AVAILABLE',
								is_public_visible: true,
								organization_id: 'org-1',
								created_by: 'user-1',
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							},
							race_category: {
								id: 'cat-1',
								short_id: '1',
								name: 'ABS',
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							},
							race_category_gender: {
								id: 'gender-1',
								short_id: '1',
								name: 'MALE',
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							},
							race_category_length: {
								id: 'length-1',
								short_id: '1',
								name: 'LONG',
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							},
							race_ranking: {
								id: 'ranking-1',
								short_id: '1',
								name: 'UCI',
								description: 'UCI ranking',
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							}
						},
						ranking_point: {
							id: 'rp-3',
							short_id: '3',
							place: 3,
							points: 30,
							race_ranking_id: 'ranking-1',
							created_at: '2024-01-01T00:00:00Z',
							updated_at: '2024-01-01T00:00:00Z'
						}
					}
				]
			};

			const result = adaptCyclistWithResultsFromRpc(rpcData);

			// Points should be copied from ranking_point
			expect(result.raceResults![0].points).toBe(30);
			expect(result.raceResults![0].rankingPoint?.points).toBe(30);
		});
	});
});

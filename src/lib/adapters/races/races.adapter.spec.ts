/**
 * Unit Tests: Races Adapter
 *
 * Tests transformation of race data from DB format to domain format.
 */

import { describe, it, expect } from 'vitest';
import { adaptRaceFromDb, adaptRaceWithResultsFromDb } from './races.adapter';
import type { RaceDB, RaceWithResultsResponse } from '$lib/types/db';

describe('Races Adapter', () => {
	describe('adaptRaceFromDb', () => {
		it('should transform DB race to domain Race', () => {
			const dbRace: RaceDB = {
				id: '123',
				name: 'Gran Fondo - LONG/MALE/ABS',
				description: 'Long distance race',
				date_time: '2024-06-15T09:00:00Z',
				is_public_visible: true,
				event_id: 'event-123',
				race_category_id: 'cat-1',
				race_category_gender_id: 'gender-1',
				race_category_length_id: 'length-1',
				race_ranking_id: 'ranking-uci',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			};

			const result = adaptRaceFromDb(dbRace);

			expect(result).toEqual({
				id: '123', // UUID id
				name: 'Gran Fondo - LONG/MALE/ABS',
				description: 'Long distance race',
				dateTime: '2024-06-15T09:00:00Z',
				isPublicVisible: true,
				eventId: 'event-123', // Foreign keys are NOT transformed
				raceCategoryId: 'cat-1', // Foreign keys are NOT transformed
				raceCategoryGenderId: 'gender-1', // Foreign keys are NOT transformed
				raceCategoryLengthId: 'length-1', // Foreign keys are NOT transformed
				raceRankingId: 'ranking-uci', // Foreign keys are NOT transformed
				createdAt: expect.any(String),
				updatedAt: expect.any(String)
			});
		});

		it('should handle null description', () => {
			const dbRace: RaceDB = {
				id: '123',
				name: 'Race Name',
				description: null,
				date_time: '2024-01-01T00:00:00Z',
				is_public_visible: false,
				event_id: 'event-1',
				race_category_id: 'cat-1',
				race_category_gender_id: 'gender-1',
				race_category_length_id: 'length-1',
				race_ranking_id: 'ranking-1',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			};

			const result = adaptRaceFromDb(dbRace);

			expect(result.description).toBeNull();
		});

		it('should preserve visibility flags', () => {
			const publicRace: RaceDB = {
				id: '1',
				name: 'Public Race',
				description: null,
				date_time: '2024-01-01T00:00:00Z',
				is_public_visible: true,
				event_id: 'event-1',
				race_category_id: 'cat-1',
				race_category_gender_id: 'gender-1',
				race_category_length_id: 'length-1',
				race_ranking_id: 'ranking-1',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			};

			const privateRace: RaceDB = {
				id: '2',
				name: 'Private Race',
				description: null,
				date_time: '2024-01-01T00:00:00Z',
				is_public_visible: false,
				event_id: 'event-1',
				race_category_id: 'cat-1',
				race_category_gender_id: 'gender-1',
				race_category_length_id: 'length-1',
				race_ranking_id: 'ranking-1',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			};

			expect(adaptRaceFromDb(publicRace).isPublicVisible).toBe(true);
			expect(adaptRaceFromDb(privateRace).isPublicVisible).toBe(false);
		});
	});

	describe('adaptRaceWithResultsFromDb', () => {
		it('should transform race with results to domain RaceWithRelations', () => {
			const dbRace: RaceWithResultsResponse = {
				id: '123',
				name: 'Gran Fondo - LONG/MALE/ABS',
				description: 'Long distance race',
				date_time: '2024-06-15T09:00:00Z',
				is_public_visible: true,
				event_id: 'event-123',
				race_category_id: 'cat-1',
				race_category_gender_id: 'gender-1',
				race_category_length_id: 'length-1',
				race_ranking_id: 'ranking-uci',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
				race_results: [
					{
						id: '1',
						place: 1,
						time: '02:30:45',
						points: 100,
						created_at: '2024-01-01T00:00:00Z',
						updated_at: '2024-01-01T00:00:00Z',
						cyclist_id: '1',
						race_id: '123',
						ranking_point_id: null,
						cyclists: {
							id: '1',
							born_year: 1995,
							gender_id: 'gender-1',
							user_id: 'u1',
							created_at: '2024-01-01T00:00:00Z',
							updated_at: '2024-01-01T00:00:00Z',
							users: {
								id: 'u1',
								first_name: 'Carlos',
								last_name: 'Rodríguez',
								role_id: 'role-cyclist',
								auth_user_id: null,
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							}
						},
						ranking_points: {
							id: '1',
							place: 1,
							points: 100,
							race_ranking_id: 'ranking-uci',
							created_at: '2024-01-01T00:00:00Z',
							updated_at: '2024-01-01T00:00:00Z'
						}
					}
				]
			};

			const result = adaptRaceWithResultsFromDb(dbRace);

			expect(result.id).toBe('123'); // UUID id
			expect(result.name).toBe('Gran Fondo - LONG/MALE/ABS');
			expect(result.raceResults).toHaveLength(1);
			expect(result.raceResults?.[0].place).toBe(1);
			expect(result.raceResults?.[0]!.cyclistId).toBe('1');
			expect(result.raceResults?.[0]!.rankingPoint?.points).toBe(100);
		});

		it('should handle empty results array', () => {
			const dbRace: RaceWithResultsResponse = {
				id: '123',
				name: 'Race with no results',
				description: null,
				date_time: '2024-01-01T00:00:00Z',
				is_public_visible: true,
				event_id: 'event-1',
				race_category_id: 'cat-1',
				race_category_gender_id: 'gender-1',
				race_category_length_id: 'length-1',
				race_ranking_id: 'ranking-1',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
				race_results: []
			};

			const result = adaptRaceWithResultsFromDb(dbRace);

			expect(result.raceResults).toEqual([]);
		});

		it('should handle null ranking_points in results', () => {
			const dbRace: RaceWithResultsResponse = {
				id: '123',
				name: 'Race',
				description: null,
				date_time: '2024-01-01T00:00:00Z',
				is_public_visible: true,
				event_id: 'event-1',
				race_category_id: 'cat-1',
				race_category_gender_id: 'gender-1',
				race_category_length_id: 'length-1',
				race_ranking_id: 'ranking-1',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
				race_results: [
					{
						id: '1',
						place: 1,
						time: '02:30:45',
						points: null,
						ranking_point_id: null,
						created_at: '2024-01-01T00:00:00Z',
						updated_at: '2024-01-01T00:00:00Z',
						cyclist_id: '1',
						race_id: '123',
						cyclists: {
							id: '1',
							born_year: 1995,
							gender_id: 'gender-1',
							user_id: 'u1',
							created_at: '2024-01-01T00:00:00Z',
							updated_at: '2024-01-01T00:00:00Z',
							users: {
								id: 'u1',
								first_name: 'Test',
								last_name: 'Cyclist',
								role_id: 'role-cyclist',
								auth_user_id: null,
								created_at: '2024-01-01T00:00:00Z',
								updated_at: '2024-01-01T00:00:00Z'
							}
						},
						ranking_points: null
					}
				]
			};

			const result = adaptRaceWithResultsFromDb(dbRace);

			expect(result.raceResults?.[0]!.rankingPoint).toBeUndefined();
		});
	});
});

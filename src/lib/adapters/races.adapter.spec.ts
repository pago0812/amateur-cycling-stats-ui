/**
 * Unit Tests: Races Adapter
 *
 * Tests transformation of race data from DB format to domain format.
 */

import { describe, it, expect } from 'vitest';
import { adaptRaceFromDb, adaptRaceWithResultsFromDb } from './races.adapter';
import type { RaceDB, RaceWithResultsResponse } from '$lib/types/db';
import { createMockDbRow } from '$lib/test-utils/supabase-mock';

describe('Races Adapter', () => {
	describe('adaptRaceFromDb', () => {
		it('should transform DB race to domain Race', () => {
			const dbRace: RaceDB = createMockDbRow({
				id: 'race-123',
				name: 'Gran Fondo - LONG/MALE/ABS',
				description: 'Long distance race',
				date_time: '2024-06-15T09:00:00Z',
				is_public_visible: true,
				event_id: 'event-123',
				race_category_id: 'cat-abs',
				race_category_gender_id: 'gender-male',
				race_category_length_id: 'length-long',
				race_ranking_id: 'ranking-uci'
			});

			const result = adaptRaceFromDb(dbRace);

			expect(result).toEqual({
				id: 'race-123',
				name: 'Gran Fondo - LONG/MALE/ABS',
				description: 'Long distance race',
				dateTime: '2024-06-15T09:00:00Z',
				isPublicVisible: true,
				eventId: 'event-123',
				raceCategoryId: 'cat-abs',
				raceCategoryGenderId: 'gender-male',
				raceCategoryLengthId: 'length-long',
				raceRankingId: 'ranking-uci',
				createdAt: expect.any(String),
				updatedAt: expect.any(String)
			});
		});

		it('should handle null description', () => {
			const dbRace: RaceDB = createMockDbRow({
				id: 'race-123',
				name: 'Race Name',
				description: null,
				date_time: '2024-01-01T00:00:00Z',
				is_public_visible: false,
				event_id: 'event-1',
				race_category_id: 'cat-1',
				race_category_gender_id: 'gender-1',
				race_category_length_id: 'length-1',
				race_ranking_id: 'ranking-1'
			});

			const result = adaptRaceFromDb(dbRace);

			expect(result.description).toBeNull();
		});

		it('should preserve visibility flags', () => {
			const publicRace: RaceDB = createMockDbRow({
				id: '1',
				name: 'Public Race',
				description: null,
				date_time: '2024-01-01T00:00:00Z',
				is_public_visible: true,
				event_id: 'event-1',
				race_category_id: 'cat-1',
				race_category_gender_id: 'gender-1',
				race_category_length_id: 'length-1',
				race_ranking_id: 'ranking-1'
			});

			const privateRace: RaceDB = createMockDbRow({
				id: '2',
				name: 'Private Race',
				description: null,
				date_time: '2024-01-01T00:00:00Z',
				is_public_visible: false,
				event_id: 'event-1',
				race_category_id: 'cat-1',
				race_category_gender_id: 'gender-1',
				race_category_length_id: 'length-1',
				race_ranking_id: 'ranking-1'
			});

			expect(adaptRaceFromDb(publicRace).isPublicVisible).toBe(true);
			expect(adaptRaceFromDb(privateRace).isPublicVisible).toBe(false);
		});
	});

	describe('adaptRaceWithResultsFromDb', () => {
		it('should transform race with results to domain RaceWithRelations', () => {
			const dbRace: RaceWithResultsResponse = createMockDbRow({
				id: 'race-123',
				name: 'Gran Fondo - LONG/MALE/ABS',
				description: 'Long distance race',
				date_time: '2024-06-15T09:00:00Z',
				is_public_visible: true,
				event_id: 'event-123',
				race_category_id: 'cat-abs',
				race_category_gender_id: 'gender-male',
				race_category_length_id: 'length-long',
				race_ranking_id: 'ranking-uci',
				race_results: [
					{
						id: 'result-1',
						place: 1,
						time: '02:30:45',
						points: 100,
						race_id: 'race-123',
						cyclist_id: 'cyclist-1',
						ranking_point_id: 'rp-1',
						created_at: '2024-01-01T00:00:00Z',
						updated_at: '2024-01-01T00:00:00Z',
						cyclists: {
							id: 'cyclist-1',
							name: 'Carlos',
							last_name: 'Rodríguez',
							born_year: 1995,
							gender_id: 'gender-male',
							user_id: 'user-1',
							created_at: '2024-01-01T00:00:00Z',
							updated_at: '2024-01-01T00:00:00Z'
						},
						ranking_points: {
							id: 'rp-1',
							place: 1,
							points: 100,
							race_ranking_id: 'ranking-uci',
							created_at: '2024-01-01T00:00:00Z',
							updated_at: '2024-01-01T00:00:00Z'
						}
					}
				]
			});

			const result = adaptRaceWithResultsFromDb(dbRace);

			expect(result.id).toBe('race-123');
			expect(result.name).toBe('Gran Fondo - LONG/MALE/ABS');
			expect(result.raceResults).toHaveLength(1);
			expect(result.raceResults?.[0].place).toBe(1);
			expect(result.raceResults?.[0]!.cyclist!.name).toBe('Carlos');
			expect(result.raceResults?.[0]!.cyclist!.lastName).toBe('Rodríguez');
			expect(result.raceResults?.[0]!.rankingPoint?.points).toBe(100);
		});

		it('should handle empty results array', () => {
			const dbRace: RaceWithResultsResponse = createMockDbRow({
				id: 'race-123',
				name: 'Race with no results',
				description: null,
				date_time: '2024-01-01T00:00:00Z',
				is_public_visible: true,
				event_id: 'event-1',
				race_category_id: 'cat-1',
				race_category_gender_id: 'gender-1',
				race_category_length_id: 'length-1',
				race_ranking_id: 'ranking-1',
				race_results: []
			});

			const result = adaptRaceWithResultsFromDb(dbRace);

			expect(result.raceResults).toEqual([]);
		});

		it('should handle null ranking_points in results', () => {
			const dbRace: RaceWithResultsResponse = createMockDbRow({
				id: 'race-123',
				name: 'Race',
				description: null,
				date_time: '2024-01-01T00:00:00Z',
				is_public_visible: true,
				event_id: 'event-1',
				race_category_id: 'cat-1',
				race_category_gender_id: 'gender-1',
				race_category_length_id: 'length-1',
				race_ranking_id: 'ranking-1',
				race_results: [
					{
						id: 'result-1',
						place: 1,
						time: '02:30:45',
						points: null,
						race_id: 'race-123',
						cyclist_id: 'cyclist-1',
						ranking_point_id: null,
						created_at: '2024-01-01T00:00:00Z',
						updated_at: '2024-01-01T00:00:00Z',
						cyclists: {
							id: 'cyclist-1',
							name: 'Test',
							last_name: 'Cyclist',
							born_year: 1995,
							gender_id: 'gender-1',
							user_id: null,
							created_at: '2024-01-01T00:00:00Z',
							updated_at: '2024-01-01T00:00:00Z'
						},
						ranking_points: null
					}
				]
			});

			const result = adaptRaceWithResultsFromDb(dbRace);

			expect(result.raceResults?.[0]!.rankingPoint).toBeUndefined();
		});
	});
});

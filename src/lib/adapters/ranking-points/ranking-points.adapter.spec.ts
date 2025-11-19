/**
 * Unit Tests: Ranking Points Adapter
 *
 * Tests transformation of ranking point data from DB format to domain format.
 */

import { describe, it, expect } from 'vitest';
import { adaptRankingPointFromDb } from './ranking-points.adapter';
import type { RankingPointDB } from '$lib/types/db';

describe('Ranking Points Adapter', () => {
	describe('adaptRankingPointFromDb', () => {
		it('should transform DB ranking point to domain RankingPoint', () => {
			const dbRankingPoint: RankingPointDB = {
				id: '123',
				place: 1,
				points: 100,
				race_ranking_id: 'ranking-uci',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			};

			const result = adaptRankingPointFromDb(dbRankingPoint);

			expect(result).toEqual({
				id: '123', // UUID id
				place: 1,
				points: 100,
				raceRankingId: 'ranking-uci', // Foreign keys are NOT transformed
				createdAt: expect.any(String),
				updatedAt: expect.any(String)
			});
		});

		it('should handle different place and points values', () => {
			const testCases = [
				{ place: 1, points: 100 },
				{ place: 2, points: 50 },
				{ place: 3, points: 30 },
				{ place: 10, points: 5 },
				{ place: 20, points: 1 }
			];

			testCases.forEach(({ place, points }) => {
				const dbRankingPoint: RankingPointDB = {
					id: `${place}`,
					place,
					points,
					race_ranking_id: 'ranking-test',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				};

				const result = adaptRankingPointFromDb(dbRankingPoint);

				expect(result.place).toBe(place);
				expect(result.points).toBe(points);
			});
		});

		it('should handle different ranking systems', () => {
			const rankingSystems = [
				'ranking-uci',
				'ranking-national',
				'ranking-regional',
				'ranking-custom'
			];

			rankingSystems.forEach((rankingId) => {
				const dbRankingPoint: RankingPointDB = {
					id: rankingId.split('-')[1],
					place: 1,
					points: 100,
					race_ranking_id: rankingId,
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				};

				const result = adaptRankingPointFromDb(dbRankingPoint);

				expect(result.raceRankingId).toBe(rankingId);
			});
		});

		it('should handle inline object format (from nested queries)', () => {
			const inlineRankingPoint = {
				id: 'inline',
				place: 3,
				points: 30,
				race_ranking_id: 'ranking-uci',
				created_at: '2024-02-15T14:30:00Z',
				updated_at: '2024-02-15T14:30:00Z'
			};

			const result = adaptRankingPointFromDb(inlineRankingPoint);

			expect(result).toEqual({
				id: 'inline', // Uses id directly from inline object
				place: 3,
				points: 30,
				raceRankingId: 'ranking-uci', // Foreign keys are NOT transformed
				createdAt: '2024-02-15T14:30:00Z',
				updatedAt: '2024-02-15T14:30:00Z'
			});
		});

		it('should transform snake_case to camelCase correctly', () => {
			const dbRankingPoint: RankingPointDB = {
				id: 'testxcase',
				place: 7,
				points: 10,
				race_ranking_id: 'ranking-test-system',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			};

			const result = adaptRankingPointFromDb(dbRankingPoint);

			// Verify snake_case fields are transformed to camelCase
			expect(result).toHaveProperty('raceRankingId');
			expect(result).toHaveProperty('createdAt');
			expect(result).toHaveProperty('updatedAt');

			// Verify snake_case fields don't exist
			expect(result).not.toHaveProperty('race_ranking_id');
			expect(result).not.toHaveProperty('created_at');
			expect(result).not.toHaveProperty('updated_at');
		});
	});
});

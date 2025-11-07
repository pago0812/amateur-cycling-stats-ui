/**
 * Unit Tests: Race Categories Adapter
 *
 * Tests transformation of race category data from DB format to domain format.
 */

import { describe, it, expect } from 'vitest';
import {
	adaptRaceCategoryFromDb,
	adaptRaceCategoryGenderFromDb,
	adaptRaceCategoryLengthFromDb
} from './race-categories.adapter';
import type { RaceCategoryDB, RaceCategoryGenderDB, RaceCategoryLengthDB } from '$lib/types/db';

describe('Race Categories Adapter', () => {
	describe('adaptRaceCategoryFromDb', () => {
		it('should transform DB race category to domain RaceCategory', () => {
			const dbCategory: RaceCategoryDB = {
				id: 'cat-abs',
				short_id: 'abs',
				name: 'ABS',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			};

			const result = adaptRaceCategoryFromDb(dbCategory);

			expect(result).toEqual({
				id: 'abs', // short_id extracted from 'cat-abs'
				name: 'ABS',
				createdAt: expect.any(String),
				updatedAt: expect.any(String)
			});
		});

		it('should handle different category names', () => {
			const categories = ['ABS', 'ELITE', 'SUB23', 'MASTER30', 'MASTER40', 'MASTER50'];

			categories.forEach((categoryName) => {
				const dbCategory: RaceCategoryDB = {
					id: `cat-${categoryName.toLowerCase()}`,
					short_id: categoryName.toLowerCase(),
					name: categoryName,
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				};

				const result = adaptRaceCategoryFromDb(dbCategory);

				expect(result.name).toBe(categoryName);
				expect(result.id).toBe(categoryName.toLowerCase()); // short_id extracted from last part
			});
		});
	});

	describe('adaptRaceCategoryGenderFromDb', () => {
		it('should transform DB race category gender to domain RaceCategoryGender', () => {
			const dbGender: RaceCategoryGenderDB = {
				id: 'gender-male',
				short_id: 'male',
				name: 'MALE',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			};

			const result = adaptRaceCategoryGenderFromDb(dbGender);

			expect(result).toEqual({
				id: 'male', // short_id extracted from 'gender-male'
				name: 'MALE',
				createdAt: expect.any(String),
				updatedAt: expect.any(String)
			});
		});

		it('should handle all gender types', () => {
			const genders = ['MALE', 'FEMALE', 'OPEN'];

			genders.forEach((genderName) => {
				const dbGender: RaceCategoryGenderDB = {
					id: `gender-${genderName.toLowerCase()}`,
					short_id: genderName.toLowerCase(),
					name: genderName,
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				};

				const result = adaptRaceCategoryGenderFromDb(dbGender);

				expect(result.name).toBe(genderName);
				expect(result.id).toBe(genderName.toLowerCase()); // short_id extracted from last part
			});
		});
	});

	describe('adaptRaceCategoryLengthFromDb', () => {
		it('should transform DB race category length to domain RaceCategoryLength', () => {
			const dbLength: RaceCategoryLengthDB = {
				id: 'length-long',
				short_id: 'long',
				name: 'LONG',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			};

			const result = adaptRaceCategoryLengthFromDb(dbLength);

			expect(result).toEqual({
				id: 'long', // short_id extracted from 'length-long'
				name: 'LONG',
				createdAt: expect.any(String),
				updatedAt: expect.any(String)
			});
		});

		it('should handle all length types', () => {
			const lengths = ['LONG', 'SHORT', 'SPRINT', 'UNIQUE'];

			lengths.forEach((lengthName) => {
				const dbLength: RaceCategoryLengthDB = {
					id: `length-${lengthName.toLowerCase()}`,
					short_id: lengthName.toLowerCase(),
					name: lengthName,
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				};

				const result = adaptRaceCategoryLengthFromDb(dbLength);

				expect(result.name).toBe(lengthName);
				expect(result.id).toBe(lengthName.toLowerCase()); // short_id extracted from last part
			});
		});
	});
});

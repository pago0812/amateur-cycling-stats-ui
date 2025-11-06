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
import { createMockDbRow } from '$lib/test-utils/supabase-mock';

describe('Race Categories Adapter', () => {
	describe('adaptRaceCategoryFromDb', () => {
		it('should transform DB race category to domain RaceCategory', () => {
			const dbCategory: RaceCategoryDB = createMockDbRow({
				id: 'cat-abs',
				name: 'ABS'
			});

			const result = adaptRaceCategoryFromDb(dbCategory);

			expect(result).toEqual({
				id: 'cat-abs',
				name: 'ABS',
				createdAt: expect.any(String),
				updatedAt: expect.any(String)
			});
		});

		it('should handle different category names', () => {
			const categories = ['ABS', 'ELITE', 'SUB23', 'MASTER30', 'MASTER40', 'MASTER50'];

			categories.forEach((categoryName) => {
				const dbCategory: RaceCategoryDB = createMockDbRow({
					id: `cat-${categoryName.toLowerCase()}`,
					name: categoryName
				});

				const result = adaptRaceCategoryFromDb(dbCategory);

				expect(result.name).toBe(categoryName);
				expect(result.id).toBe(`cat-${categoryName.toLowerCase()}`);
			});
		});
	});

	describe('adaptRaceCategoryGenderFromDb', () => {
		it('should transform DB race category gender to domain RaceCategoryGender', () => {
			const dbGender: RaceCategoryGenderDB = createMockDbRow({
				id: 'gender-male',
				name: 'MALE'
			});

			const result = adaptRaceCategoryGenderFromDb(dbGender);

			expect(result).toEqual({
				id: 'gender-male',
				name: 'MALE',
				createdAt: expect.any(String),
				updatedAt: expect.any(String)
			});
		});

		it('should handle all gender types', () => {
			const genders = ['MALE', 'FEMALE', 'OPEN'];

			genders.forEach((genderName) => {
				const dbGender: RaceCategoryGenderDB = createMockDbRow({
					id: `gender-${genderName.toLowerCase()}`,
					name: genderName
				});

				const result = adaptRaceCategoryGenderFromDb(dbGender);

				expect(result.name).toBe(genderName);
				expect(result.id).toBe(`gender-${genderName.toLowerCase()}`);
			});
		});
	});

	describe('adaptRaceCategoryLengthFromDb', () => {
		it('should transform DB race category length to domain RaceCategoryLength', () => {
			const dbLength: RaceCategoryLengthDB = createMockDbRow({
				id: 'length-long',
				name: 'LONG'
			});

			const result = adaptRaceCategoryLengthFromDb(dbLength);

			expect(result).toEqual({
				id: 'length-long',
				name: 'LONG',
				createdAt: expect.any(String),
				updatedAt: expect.any(String)
			});
		});

		it('should handle all length types', () => {
			const lengths = ['LONG', 'SHORT', 'SPRINT', 'UNIQUE'];

			lengths.forEach((lengthName) => {
				const dbLength: RaceCategoryLengthDB = createMockDbRow({
					id: `length-${lengthName.toLowerCase()}`,
					name: lengthName
				});

				const result = adaptRaceCategoryLengthFromDb(dbLength);

				expect(result.name).toBe(lengthName);
				expect(result.id).toBe(`length-${lengthName.toLowerCase()}`);
			});
		});
	});
});

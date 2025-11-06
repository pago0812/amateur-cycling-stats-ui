/**
 * Unit Tests: Common Adapter Utilities
 *
 * Tests the reusable transformation utilities used across all adapters.
 */

import { describe, it, expect } from 'vitest';
import { mapTimestamps, adaptArray, isDefined } from './common.adapter';

describe('Common Adapter Utilities', () => {
	describe('mapTimestamps', () => {
		it('should transform snake_case timestamps to camelCase', () => {
			const dbData = {
				id: '123',
				name: 'Test',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-02T00:00:00Z'
			};

			const result = mapTimestamps(dbData);

			expect(result).toEqual({
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-02T00:00:00Z'
			});
		});

		it('should handle missing timestamps by providing defaults', () => {
			const dbData = {
				id: '123',
				name: 'Test',
				created_at: null,
				updated_at: null
			};

			const result = mapTimestamps(dbData);

			// mapTimestamps provides current date as default when timestamps are null
			expect(result.createdAt).toBeDefined();
			expect(result.updatedAt).toBeDefined();
			expect(typeof result.createdAt).toBe('string');
			expect(typeof result.updatedAt).toBe('string');
			// Should be valid ISO date strings
			expect(new Date(result.createdAt).toISOString()).toBe(result.createdAt);
			expect(new Date(result.updatedAt).toISOString()).toBe(result.updatedAt);
		});

		it('should preserve original timestamp format', () => {
			const timestamp = '2024-01-01T12:30:45.123Z';
			const dbData = {
				created_at: timestamp,
				updated_at: timestamp
			};

			const result = mapTimestamps(dbData);

			expect(result.createdAt).toBe(timestamp);
			expect(result.updatedAt).toBe(timestamp);
		});
	});

	describe('adaptArray', () => {
		it('should transform array of items using adapter function', () => {
			const dbArray = [
				{ id: '1', snake_case_field: 'value1' },
				{ id: '2', snake_case_field: 'value2' },
				{ id: '3', snake_case_field: 'value3' }
			];

			const adapter = (item: any) => ({
				id: item.id,
				camelCaseField: item.snake_case_field
			});

			const result = adaptArray(dbArray, adapter);

			expect(result).toEqual([
				{ id: '1', camelCaseField: 'value1' },
				{ id: '2', camelCaseField: 'value2' },
				{ id: '3', camelCaseField: 'value3' }
			]);
		});

		it('should handle empty array', () => {
			const result = adaptArray([], (item: any) => item);

			expect(result).toEqual([]);
		});

		it('should handle undefined input', () => {
			const result = adaptArray(undefined, (item: any) => item);

			expect(result).toEqual([]);
		});

		it('should handle null input', () => {
			const result = adaptArray(null, (item: any) => item);

			expect(result).toEqual([]);
		});

		it('should preserve array order', () => {
			const dbArray = [
				{ id: '3', value: 'third' },
				{ id: '1', value: 'first' },
				{ id: '2', value: 'second' }
			];

			const adapter = (item: any) => ({ id: item.id, value: item.value });

			const result = adaptArray(dbArray, adapter);

			expect(result[0].id).toBe('3');
			expect(result[1].id).toBe('1');
			expect(result[2].id).toBe('2');
		});
	});

	describe('isDefined', () => {
		it('should return true for defined values', () => {
			expect(isDefined(0)).toBe(true);
			expect(isDefined('')).toBe(true);
			expect(isDefined(false)).toBe(true);
			expect(isDefined([])).toBe(true);
			expect(isDefined({})).toBe(true);
			expect(isDefined('text')).toBe(true);
			expect(isDefined(123)).toBe(true);
		});

		it('should return false for undefined', () => {
			expect(isDefined(undefined)).toBe(false);
		});

		it('should return false for null', () => {
			expect(isDefined(null)).toBe(false);
		});

		it('should work as type guard', () => {
			const value: string | undefined | null = 'test';

			if (isDefined(value)) {
				// TypeScript should know value is string here
				expect(value.toUpperCase()).toBe('TEST');
			}
		});

		it('should filter undefined values from array', () => {
			const array = [1, undefined, 2, null, 3, undefined];

			const filtered = array.filter(isDefined);

			expect(filtered).toEqual([1, 2, 3]);
		});
	});
});

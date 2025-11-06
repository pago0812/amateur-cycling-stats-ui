/**
 * Unit Tests: Date Utilities
 *
 * Tests date formatting and manipulation functions.
 */

import { describe, it, expect } from 'vitest';
import { formatDateToMMDD, dateStartOfYear, dateEndOfYear } from './dates';

describe('Date Utilities', () => {
	describe('formatDateToMMDD', () => {
		it('should format date to Spanish dd-MMM format', () => {
			const date = '2024-06-15T09:30:00Z';

			const result = formatDateToMMDD(date);

			// Format is "dd-MMM" with Spanish locale (e.g., "15-jun")
			expect(result).toMatch(/^\d{2}-[a-z]{3}$/);
			expect(result).toContain('15');
		});

		it('should handle single digit day with zero padding', () => {
			const date = '2024-01-05T12:00:00Z';

			const result = formatDateToMMDD(date);

			expect(result).toMatch(/^05-/);
		});

		it('should return Spanish month abbreviations', () => {
			const date = '2024-01-15T12:00:00Z'; // January

			const result = formatDateToMMDD(date);

			// Spanish month abbreviation for January
			expect(result).toContain('ene');
		});

		it('should handle empty date', () => {
			const result = formatDateToMMDD(undefined);

			expect(result).toBe('');
		});

		it('should handle dates from different months', () => {
			const jan = '2024-01-15T12:00:00Z';
			const jun = '2024-06-15T12:00:00Z';
			const dec = '2024-12-15T12:00:00Z';

			const resultJan = formatDateToMMDD(jan);
			const resultJun = formatDateToMMDD(jun);
			const resultDec = formatDateToMMDD(dec);

			// All should be day-month format
			expect(resultJan).toMatch(/^15-ene$/);
			expect(resultJun).toMatch(/^15-jun$/);
			expect(resultDec).toMatch(/^15-dic$/);
		});
	});

	describe('dateStartOfYear', () => {
		it('should return start of year in yyyy-MM-dd format', () => {
			const result = dateStartOfYear(2024);

			expect(result).toBe('2024-01-01');
		});

		it('should handle different years', () => {
			const result2023 = dateStartOfYear(2023);
			const result2024 = dateStartOfYear(2024);
			const result2025 = dateStartOfYear(2025);

			expect(result2023).toBe('2023-01-01');
			expect(result2024).toBe('2024-01-01');
			expect(result2025).toBe('2025-01-01');
		});

		it('should return January 1st for any year', () => {
			const result = dateStartOfYear(2024);

			// Should always be January 1st
			expect(result).toMatch(/-01-01$/);
		});

		it('should handle no year parameter (uses current year)', () => {
			const result = dateStartOfYear();

			// Should return a valid date format
			expect(result).toMatch(/^\d{4}-01-01$/);
		});
	});

	describe('dateEndOfYear', () => {
		it('should return end of year in yyyy-MM-dd format', () => {
			const result = dateEndOfYear(2024);

			expect(result).toBe('2024-12-31');
		});

		it('should handle different years', () => {
			const result2023 = dateEndOfYear(2023);
			const result2024 = dateEndOfYear(2024);
			const result2025 = dateEndOfYear(2025);

			expect(result2023).toBe('2023-12-31');
			expect(result2024).toBe('2024-12-31');
			expect(result2025).toBe('2025-12-31');
		});

		it('should return December 31st for any year', () => {
			const result = dateEndOfYear(2024);

			// Should always be December 31st
			expect(result).toMatch(/-12-31$/);
		});

		it('should handle no year parameter (uses current year)', () => {
			const result = dateEndOfYear();

			// Should return a valid date format
			expect(result).toMatch(/^\d{4}-12-31$/);
		});
	});

	describe('year range validation', () => {
		it('dateStartOfYear and dateEndOfYear should create valid year span', () => {
			const year = 2024;
			const start = dateStartOfYear(year);
			const end = dateEndOfYear(year);

			// Both should be from the same year
			expect(start).toContain('2024');
			expect(end).toContain('2024');

			// Start should be January, end should be December
			expect(start).toBe('2024-01-01');
			expect(end).toBe('2024-12-31');
		});
	});
});

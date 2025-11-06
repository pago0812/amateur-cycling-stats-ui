/**
 * Unit Tests: Events Adapter
 *
 * Tests transformation of event data from DB format to domain format.
 */

import { describe, it, expect } from 'vitest';
import { adaptEventFromDb, adaptEventWithRelationsFromDb } from './events.adapter';
import type { EventDB, EventWithCategoriesResponse } from '$lib/types/db';
import { createMockDbRow } from '$lib/test-utils/supabase-mock';

describe('Events Adapter', () => {
	describe('adaptEventFromDb', () => {
		it('should transform DB event to domain Event', () => {
			const dbEvent: EventDB = createMockDbRow({
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: 'Gran Fondo Valencia',
				description: 'Annual cycling event',
				date_time: '2024-06-15T09:00:00Z',
				year: 2024,
				city: 'Valencia',
				state: 'Valencia',
				country: 'Spain',
				event_status: 'AVAILABLE',
				is_public_visible: true,
				organization_id: 'org-123',
				created_by: 'user-123'
			});

			const result = adaptEventFromDb(dbEvent);

			expect(result).toEqual({
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: 'Gran Fondo Valencia',
				description: 'Annual cycling event',
				dateTime: '2024-06-15T09:00:00Z',
				year: 2024,
				city: 'Valencia',
				state: 'Valencia',
				country: 'Spain',
				eventStatus: 'AVAILABLE',
				isPublicVisible: true,
				organizationId: 'org-123',
				createdBy: 'user-123',
				createdAt: expect.any(String),
				updatedAt: expect.any(String)
			});
		});

		it('should handle null description', () => {
			const dbEvent: EventDB = createMockDbRow({
				id: '123',
				name: 'Test Event',
				description: null,
				date_time: '2024-01-01T00:00:00Z',
				year: 2024,
				city: 'City',
				state: 'State',
				country: 'Country',
				event_status: 'DRAFT',
				is_public_visible: false,
				organization_id: 'org-1',
				created_by: 'user-1'
			});

			const result = adaptEventFromDb(dbEvent);

			expect(result.description).toBeNull();
		});

		it('should preserve event status enum', () => {
			const statuses = ['DRAFT', 'AVAILABLE', 'SOLD_OUT', 'ON_GOING', 'FINISHED'] as const;

			statuses.forEach((status) => {
				const dbEvent: EventDB = createMockDbRow({
					id: '123',
					name: 'Event',
					description: null,
					date_time: '2024-01-01T00:00:00Z',
					year: 2024,
					city: 'City',
					state: 'State',
					country: 'Country',
					event_status: status,
					is_public_visible: true,
					organization_id: 'org-1',
					created_by: 'user-1'
				});

				const result = adaptEventFromDb(dbEvent);

				expect(result.eventStatus).toBe(status);
			});
		});
	});

	describe('adaptEventWithRelationsFromDb', () => {
		it('should transform event with categories to domain EventWithRelations', () => {
			const dbEvent: EventWithCategoriesResponse = createMockDbRow({
				id: '123',
				name: 'Gran Fondo',
				description: 'Test',
				date_time: '2024-06-15T09:00:00Z',
				year: 2024,
				city: 'Valencia',
				state: 'Valencia',
				country: 'Spain',
				event_status: 'AVAILABLE',
				is_public_visible: true,
				organization_id: 'org-123',
				created_by: 'user-123',
				supportedCategories: [
					{
						race_categories: {
							id: 'cat-1',
							name: 'ABS',
							created_at: '2024-01-01T00:00:00Z',
							updated_at: '2024-01-01T00:00:00Z'
						}
					},
					{
						race_categories: {
							id: 'cat-2',
							name: 'ELITE',
							created_at: '2024-01-01T00:00:00Z',
							updated_at: '2024-01-01T00:00:00Z'
						}
					}
				],
				supportedGenders: [
					{
						race_category_genders: {
							id: 'gender-1',
							name: 'MALE',
							created_at: '2024-01-01T00:00:00Z',
							updated_at: '2024-01-01T00:00:00Z'
						}
					}
				],
				supportedLengths: [
					{
						race_category_lengths: {
							id: 'length-1',
							name: 'LONG',
							created_at: '2024-01-01T00:00:00Z',
							updated_at: '2024-01-01T00:00:00Z'
						}
					}
				]
			});

			const result = adaptEventWithRelationsFromDb(dbEvent);

			expect(result.id).toBe('123');
			expect(result.name).toBe('Gran Fondo');
			expect(result.supportedRaceCategories).toHaveLength(2);
			expect(result.supportedRaceCategoryGenders).toHaveLength(1);
			expect(result.supportedRaceCategoryLengths).toHaveLength(1);
			expect(result.supportedRaceCategories![0].name).toBe('ABS');
			expect(result.supportedRaceCategoryGenders![0].name).toBe('MALE');
			expect(result.supportedRaceCategoryLengths![0].name).toBe('LONG');
		});

		it('should handle empty category arrays', () => {
			const dbEvent: EventWithCategoriesResponse = createMockDbRow({
				id: '123',
				name: 'Event',
				description: null,
				date_time: '2024-01-01T00:00:00Z',
				year: 2024,
				city: 'City',
				state: 'State',
				country: 'Country',
				event_status: 'DRAFT',
				is_public_visible: false,
				organization_id: 'org-1',
				created_by: 'user-1',
				supportedCategories: [],
				supportedGenders: [],
				supportedLengths: []
			});

			const result = adaptEventWithRelationsFromDb(dbEvent);

			expect(result.supportedRaceCategories).toEqual([]);
			expect(result.supportedRaceCategoryGenders).toEqual([]);
			expect(result.supportedRaceCategoryLengths).toEqual([]);
		});
	});
});

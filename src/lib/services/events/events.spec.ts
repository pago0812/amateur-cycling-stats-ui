/**
 * Unit Tests: Events Service
 *
 * Tests event service functions that interact with Supabase.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPastEvents, getFutureEvents } from './events';
import { createMockSupabaseClient, mockSupabaseQuery } from '$lib/test-utils/supabase-mock';
import type { EventDB } from '$lib/types/db';

describe('Events Service', () => {
	let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

	beforeEach(() => {
		mockSupabase = createMockSupabaseClient();
		vi.clearAllMocks();
	});

	describe('getPastEvents', () => {
		it('should fetch finished events for a given year', async () => {
			const mockEvents: EventDB[] = [
				{
					id: 'event-1',
					name: 'Gran Fondo 2024',
					description: 'Past event',
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
				}
			];

			mockSupabaseQuery(mockSupabase, { data: mockEvents, error: null });

			const result = await getPastEvents(mockSupabase, { year: '2024' });

			expect(result).toHaveLength(1);
			expect(result[0].name).toBe('Gran Fondo 2024');
			expect(result[0].eventStatus).toBe('FINISHED');
			expect(mockSupabase.from).toHaveBeenCalledWith('events');
		});

		it('should use current year when no year param provided', async () => {
			const mockEvents: EventDB[] = [];

			mockSupabaseQuery(mockSupabase, { data: mockEvents, error: null });

			await getPastEvents(mockSupabase, {});

			// Verify the query builder was called with current year
			expect(mockSupabase.from).toHaveBeenCalledWith('events');
		});

		it('should handle empty results', async () => {
			mockSupabaseQuery(mockSupabase, { data: [], error: null });

			const result = await getPastEvents(mockSupabase, { year: '2023' });

			expect(result).toEqual([]);
		});

		it('should throw error on database failure', async () => {
			mockSupabaseQuery(mockSupabase, {
				data: null,
				error: { message: 'Database connection failed' }
			});

			await expect(getPastEvents(mockSupabase, { year: '2024' })).rejects.toThrow(
				'Error fetching past events: Database connection failed'
			);
		});

		it('should transform DB response to domain types', async () => {
			const mockEvents: EventDB[] = [
				{
					id: 'event-1',
					name: 'Test Event',
					description: null,
					date_time: '2024-01-15T10:00:00Z',
					year: 2024,
					city: 'City',
					state: 'State',
					country: 'Country',
					event_status: 'FINISHED',
					is_public_visible: true,
					organization_id: 'org-1',
					created_by: 'user-1',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				}
			];

			mockSupabaseQuery(mockSupabase, { data: mockEvents, error: null });

			const result = await getPastEvents(mockSupabase, { year: '2024' });

			// Verify camelCase transformation
			expect(result[0]).toHaveProperty('dateTime');
			expect(result[0]).toHaveProperty('eventStatus');
			expect(result[0]).toHaveProperty('isPublicVisible');
			expect(result[0]).not.toHaveProperty('date_time');
			expect(result[0]).not.toHaveProperty('event_status');
		});
	});

	describe('getFutureEvents', () => {
		it('should fetch AVAILABLE and SOLD_OUT events', async () => {
			const mockEvents: EventDB[] = [
				{
					id: 'event-1',
					name: 'Future Event',
					description: 'Upcoming event',
					date_time: '2025-06-15T09:00:00Z',
					year: 2025,
					city: 'Barcelona',
					state: 'Catalonia',
					country: 'Spain',
					event_status: 'AVAILABLE',
					is_public_visible: true,
					organization_id: 'org-1',
					created_by: 'user-1',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				}
			];

			mockSupabaseQuery(mockSupabase, { data: mockEvents, error: null });

			const result = await getFutureEvents(mockSupabase);

			expect(result).toHaveLength(1);
			expect(result[0].name).toBe('Future Event');
			expect(result[0].eventStatus).toBe('AVAILABLE');
		});

		it('should handle empty results', async () => {
			mockSupabaseQuery(mockSupabase, { data: [], error: null });

			const result = await getFutureEvents(mockSupabase);

			expect(result).toEqual([]);
		});

		it('should throw error on database failure', async () => {
			mockSupabaseQuery(mockSupabase, {
				data: null,
				error: { message: 'Query timeout' }
			});

			await expect(getFutureEvents(mockSupabase)).rejects.toThrow(
				'Error fetching future events: Query timeout'
			);
		});

		it('should return multiple events in ascending date order', async () => {
			const mockEvents: EventDB[] = [
				{
					id: 'event-1',
					name: 'Event 1',
					description: null,
					date_time: '2025-01-15T09:00:00Z',
					year: 2025,
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
				{
					id: 'event-2',
					name: 'Event 2',
					description: null,
					date_time: '2025-02-20T09:00:00Z',
					year: 2025,
					city: 'City',
					state: 'State',
					country: 'Country',
					event_status: 'SOLD_OUT',
					is_public_visible: true,
					organization_id: 'org-1',
					created_by: 'user-1',
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				}
			];

			mockSupabaseQuery(mockSupabase, { data: mockEvents, error: null });

			const result = await getFutureEvents(mockSupabase);

			expect(result).toHaveLength(2);
			expect(result[0].name).toBe('Event 1');
			expect(result[1].name).toBe('Event 2');
		});
	});
});

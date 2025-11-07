import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { Event, EventWithRelations } from '$lib/types/domain';
import type { EventWithCategoriesResponse } from '$lib/types/db';
import { adaptEventFromDb, adaptEventWithRelationsFromDb } from '$lib/adapters';

type TypedSupabaseClient = SupabaseClient<Database>;

interface GetPastEventsParams {
	year?: string;
}

interface GetEventByIdParams {
	id: string;
}

/**
 * Get past events filtered by year.
 * Returns domain Event types with camelCase fields.
 * Uses Supabase SDK with automatic RLS policies for visibility.
 */
export async function getPastEvents(
	supabase: TypedSupabaseClient,
	params: GetPastEventsParams
): Promise<Event[]> {
	const queryYear = !isNaN(Number(params.year)) ? Number(params.year) : new Date().getFullYear();

	const { data, error } = await supabase
		.from('events')
		.select('*')
		.eq('event_status', 'FINISHED')
		.eq('year', queryYear)
		.order('date_time', { ascending: false });

	if (error) {
		throw new Error(`Error fetching past events: ${error.message}`);
	}

	// Use adapter to transform DB types → Domain types
	return (data || []).map(adaptEventFromDb);
}

/**
 * Get future events (AVAILABLE or SOLD_OUT status).
 * Returns domain Event types with camelCase fields.
 * Uses Supabase SDK with automatic RLS policies for visibility.
 */
export async function getFutureEvents(supabase: TypedSupabaseClient): Promise<Event[]> {
	const { data, error } = await supabase
		.from('events')
		.select('*')
		.in('event_status', ['AVAILABLE', 'SOLD_OUT'])
		.order('date_time', { ascending: true });

	if (error) {
		throw new Error(`Error fetching future events: ${error.message}`);
	}

	// Use adapter to transform DB types → Domain types
	return (data || []).map(adaptEventFromDb);
}

/**
 * Get event by ID with populated junction tables (categories, genders, lengths).
 * Returns domain EventWithRelations type with camelCase fields, or null if not found.
 * Single PostgreSQL query with JOINs - much faster than Strapi's multiple requests.
 *
 * ID parameter is the short_id (public ID), not UUID.
 * Query uses short_id column (indexed for fast lookups).
 *
 * Returns null when event doesn't exist (expected case).
 * Throws error only for unexpected database issues.
 */
export async function getEventWithCategoriesById(
	supabase: TypedSupabaseClient,
	params: GetEventByIdParams
): Promise<EventWithRelations | null> {
	const { data, error } = await supabase
		.from('events')
		.select(
			`
			*,
			supportedCategories:event_supported_categories(
				race_categories(*)
			),
			supportedGenders:event_supported_genders(
				race_category_genders(*)
			),
			supportedLengths:event_supported_lengths(
				race_category_lengths(*)
			)
		`
		)
		.eq('short_id', params.id) // Changed: Query by short_id instead of UUID
		.single();

	if (error) {
		// PGRST116 = no rows found - expected when event doesn't exist
		if (error.code === 'PGRST116') {
			return null;
		}
		throw new Error(`Error fetching event: ${error.message}`);
	}

	// Return null if event doesn't exist (expected case)
	if (!data) {
		return null;
	}

	// Use adapter to transform complex response → Domain type
	return adaptEventWithRelationsFromDb(data as EventWithCategoriesResponse);
}

import type { Event } from '$lib/types/domain';
import type { EventWithRaces } from '$lib/types/services';
import type { EventWithRacesResponse, TypedSupabaseClient } from '$lib/types/db';
import { adaptEventFromDb, adaptEventWithRacesFromRpc } from '$lib/adapters';

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
 * Get event by ID with races array and supported categories/genders/lengths.
 * Uses RPC function for optimized single-query fetch.
 * Returns domain EventWithRaces type with camelCase fields, or null if not found.
 *
 * ID parameter is the event's UUID.
 * RPC function handles all JOINs and data aggregation in PostgreSQL.
 *
 * Returns null when event doesn't exist (expected case).
 * Throws error only for unexpected database issues.
 */
export async function getEventWithRacesById(
	supabase: TypedSupabaseClient,
	params: GetEventByIdParams
): Promise<EventWithRaces | null> {
	const { data, error } = await supabase.rpc('get_event_with_races_by_event_id', {
		p_event_id: params.id
	});

	if (error) {
		throw new Error(`Error fetching event with races: ${error.message}`);
	}

	// RPC returns NULL when event doesn't exist
	if (!data) {
		return null;
	}

	// Type cast JSONB result (Supabase doesn't auto-infer JSONB structures)
	const typedData = data as unknown as EventWithRacesResponse;

	// Use adapter to transform RPC response → Domain type
	return adaptEventWithRacesFromRpc(typedData);
}

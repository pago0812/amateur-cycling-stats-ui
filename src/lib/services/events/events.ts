import type { Event } from '$lib/types/domain';
import type {
	EventWithRaces,
	EventWithRaceCount,
	GetEventsByOrganizationParams,
	CreateEventRequest,
	PartialEvent
} from '$lib/types/services';
import type { EventWithRacesResponse, TypedSupabaseClient } from '$lib/types/db';
import {
	adaptEventFromDb,
	adaptEventWithRacesFromRpc,
	adaptEventWithRaceCountFromRpc,
	adaptEventFromRpc,
	adaptEventFromDomain
} from '$lib/adapters';

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

// ============================================================================
// Event Management Functions (Panel CRUD)
// ============================================================================

/**
 * Get events by organization with optional filter.
 * Used in organizer panel event list.
 * Returns EventWithRaceCount[] including race count per event.
 */
export async function getEventsByOrganization(
	supabase: TypedSupabaseClient,
	params: GetEventsByOrganizationParams
): Promise<EventWithRaceCount[]> {
	const { data, error } = await supabase.rpc('get_events_by_organization', {
		p_organization_id: params.organizationId,
		p_filter: params.filter ?? 'all'
	});

	if (error) {
		throw new Error(`Error fetching organization events: ${error.message}`);
	}

	return (data ?? []).map(adaptEventWithRaceCountFromRpc);
}

/**
 * Get single event by ID for detail view.
 * Used in organizer panel event detail page.
 * Returns Event or null if not found.
 */
export async function getEventById(
	supabase: TypedSupabaseClient,
	params: { id: string }
): Promise<Event | null> {
	const { data, error } = await supabase.rpc('get_event_by_id', {
		p_event_id: params.id
	});

	if (error) {
		// Check if error is "not found" type
		if (error.code === 'P0002') {
			return null;
		}
		throw new Error(`Error fetching event: ${error.message}`);
	}

	if (!data || data.length === 0) {
		return null;
	}

	return adaptEventFromRpc(data[0]);
}

/**
 * Create a new event with category combinations.
 * Automatically generates races from cartesian product.
 * Returns created Event.
 */
export async function createEvent(
	supabase: TypedSupabaseClient,
	params: CreateEventRequest
): Promise<Event> {
	const { data, error } = await supabase.rpc('create_event', {
		p_name: params.name,
		p_description: params.description ?? '',
		p_date_time: params.dateTime,
		p_country: params.country,
		p_state: params.state,
		p_city: params.city ?? '',
		p_is_public_visible: params.isPublicVisible,
		p_category_ids: params.categoryIds,
		p_gender_ids: params.genderIds,
		p_length_ids: params.lengthIds
	});

	if (error) {
		throw new Error(`Error creating event: ${error.message}`);
	}

	if (!data || data.length === 0) {
		throw new Error('Event creation failed: no data returned');
	}

	return adaptEventFromRpc(data[0]);
}

/**
 * Update an existing event with partial data.
 * Only fields present in updates are modified.
 * Returns updated Event.
 */
export async function updateEvent(
	supabase: TypedSupabaseClient,
	eventId: string,
	updates: PartialEvent
): Promise<Event> {
	const rpcUpdates = adaptEventFromDomain(updates);

	const { data, error } = await supabase.rpc('update_event', {
		p_event_id: eventId,
		p_updates: rpcUpdates
	});

	if (error) {
		throw new Error(`Error updating event: ${error.message}`);
	}

	if (!data || data.length === 0) {
		throw new Error('Event update failed: no data returned');
	}

	return adaptEventFromRpc(data[0]);
}

/**
 * Delete an event by ID.
 * Only DRAFT events can be deleted.
 */
export async function deleteEvent(
	supabase: TypedSupabaseClient,
	params: { id: string }
): Promise<void> {
	const { error } = await supabase.rpc('delete_event', {
		p_event_id: params.id
	});

	if (error) {
		throw new Error(`Error deleting event: ${error.message}`);
	}
}

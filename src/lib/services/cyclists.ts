import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, TablesInsert } from '$lib/types/database.types';
import type { Cyclist, CyclistWithRelations } from '$lib/types/domain';
import type { CyclistWithResultsRpcResponse } from '$lib/types/db';
import { adaptCyclistWithResultsFromRpc, adaptCyclistFromDb } from '$lib/adapters';

type TypedSupabaseClient = SupabaseClient<Database>;

interface GetCyclistWithResultsByIdParams {
	id: string;
}

/**
 * Get cyclist by ID with race results and full race details.
 * Returns domain CyclistWithRelations type with camelCase fields.
 *
 * Uses optimized RPC function get_cyclist_with_results() for better performance.
 * Single PostgreSQL query with nested JOINs - much faster than multiple requests.
 * Includes race results with full race info, event details, categories, and ranking points.
 * Results are sorted by event date (most recent first).
 */
export async function getCyclistWithResultsById(
	supabase: TypedSupabaseClient,
	params: GetCyclistWithResultsByIdParams
): Promise<CyclistWithRelations> {
	const { data, error } = await supabase.rpc('get_cyclist_with_results', {
		cyclist_uuid: params.id
	});

	if (error) {
		throw new Error(`Error fetching cyclist: ${error.message}`);
	}

	if (!data) {
		throw new Error('Cyclist not found');
	}

	// Use adapter to transform RPC JSONB response → Domain type
	return adaptCyclistWithResultsFromRpc(data as unknown as CyclistWithResultsRpcResponse);
}

/**
 * Create a new cyclist.
 * Returns domain Cyclist type with camelCase fields.
 */
export async function createCyclist(
	supabase: TypedSupabaseClient,
	cyclist: {
		name: string;
		lastName: string;
		bornYear?: number | null;
		genderId?: string | null;
		userId?: string | null;
	}
): Promise<Cyclist> {
	const insertData: TablesInsert<'cyclists'> = {
		name: cyclist.name,
		last_name: cyclist.lastName,
		born_year: cyclist.bornYear ?? null,
		gender_id: cyclist.genderId ?? null,
		user_id: cyclist.userId ?? null
	};

	const { data, error } = await supabase.from('cyclists').insert(insertData).select().single();

	if (error) {
		throw new Error(`Error creating cyclist: ${error.message}`);
	}

	if (!data) {
		throw new Error('Failed to create cyclist');
	}

	// Use adapter to transform DB type → Domain type
	return adaptCyclistFromDb(data);
}

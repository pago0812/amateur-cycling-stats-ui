import type { Cyclist } from '$lib/types/domain';
import type { TypedSupabaseClient } from '$lib/types/db';
import { adaptCyclistFromRpc } from '$lib/adapters';

interface GetCyclistByIdParams {
	id: string;
}

/**
 * Get cyclist by user ID (without race results).
 * Returns domain Cyclist type with camelCase fields, or null if not found.
 *
 * Uses optimized RPC function get_cyclist_by_user_id() for better performance.
 * Queries users + roles + cyclists + auth.users tables with flattened structure.
 * Use this when you need cyclist data and will fetch race results separately.
 *
 * ID parameter is the user's UUID.
 * Returns null when user doesn't exist or is not a cyclist (expected case).
 * Throws error only for unexpected database issues.
 *
 * @param id - User's UUID
 * @returns Cyclist if found, null if user doesn't exist or is not a cyclist
 */
export async function getCyclistById(
	supabase: TypedSupabaseClient,
	params: GetCyclistByIdParams
): Promise<Cyclist | null> {
	const { data, error } = await supabase.rpc('get_cyclist_by_user_id', {
		p_user_id: params.id
	});

	if (error) {
		throw new Error(`Error fetching cyclist: ${error.message}`);
	}

	// RETURNS TABLE returns array, extract first item
	const cyclistData = data?.[0];

	if (!cyclistData) {
		return null;
	}

	// Ensure it's a cyclist (has cyclist profile)
	if (!cyclistData.cyclist_id) {
		return null;
	}

	// No type casting needed - auto-typed as CyclistDB[]
	return adaptCyclistFromRpc(cyclistData);
}

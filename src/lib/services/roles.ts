import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { RolesResponse } from '$lib/types/services/roles';
import { adaptRoleFromDb, adaptArray } from '$lib/adapters';

/**
 * Get all available roles.
 * @param supabase - Supabase client instance
 * @returns RolesResponse with roles array or error
 */
export const getRoles = async (supabase: SupabaseClient<Database>): Promise<RolesResponse> => {
	try {
		const { data: dbRoles, error } = await supabase.from('roles').select('*').order('name');

		if (error) {
			return {
				error: {
					status: 400,
					name: 'DatabaseError',
					message: error.message
				}
			};
		}

		return {
			data: {
				roles: adaptArray(dbRoles, adaptRoleFromDb)
			}
		};
	} catch (error) {
		return {
			error: {
				status: 500,
				name: 'FetchError',
				message: 'Failed to fetch roles'
			}
		};
	}
};

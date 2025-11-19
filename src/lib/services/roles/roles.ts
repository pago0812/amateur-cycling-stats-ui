import type { TypedSupabaseClient } from '$lib/types/db';
import type { GetRolesResponse } from '$lib/types/services';
import { adaptRoleFromDb, adaptArray } from '$lib/adapters';

/**
 * Get all available roles.
 * @param supabase - Supabase client instance
 * @returns RolesResponse with roles array or error
 */
export const getRoles = async (supabase: TypedSupabaseClient): Promise<GetRolesResponse> => {
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
	} catch {
		return {
			error: {
				status: 500,
				name: 'FetchError',
				message: 'Failed to fetch roles'
			}
		};
	}
};

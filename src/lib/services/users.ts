import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { SetRoleRequest, UserResponse } from '$lib/types/services/users';
import type { UserWithRelationsRpcResponse } from '$lib/types/db';
import { adaptUserWithRelationsFromRpc } from '$lib/adapters';

/**
 * Get the current user's enriched data including role and related entities.
 * Note: In most cases, you should use event.locals.user from hooks instead of calling this directly.
 * @param supabase - Supabase client instance
 * @returns UserResponse with enriched user data or error
 */
export async function getMyself(supabase: SupabaseClient<Database>): Promise<UserResponse> {
	try {
		// Get the current authenticated user
		const {
			data: { user: authUser },
			error: authError
		} = await supabase.auth.getUser();

		if (authError || !authUser) {
			return {
				error: {
					status: 401,
					name: 'AuthError',
					message: 'Not authenticated'
				}
			};
		}

		// Fetch enriched user data (RPC uses auth.uid() when no parameter provided)
		const { data: userData, error: userError } = await supabase.rpc('get_user_with_relations');

		if (userError || !userData) {
			return {
				error: {
					status: 500,
					name: 'UserDataError',
					message: 'Failed to fetch user data'
				}
			};
		}

		return {
			data: adaptUserWithRelationsFromRpc(userData as unknown as UserWithRelationsRpcResponse)
		};
	} catch (error) {
		return {
			error: {
				status: 500,
				name: 'FetchError',
				message: 'Failed to fetch user'
			}
		};
	}
}

/**
 * Update a user's role.
 * Only admins and organizer admins can update user roles (enforced by RLS).
 * @param supabase - Supabase client instance
 * @param params - User ID and new role ID
 * @returns UserResponse with updated user data or error
 */
export async function updateUser(
	supabase: SupabaseClient<Database>,
	{ roleId, userId }: SetRoleRequest
): Promise<UserResponse> {
	try {
		// Update the user's role in the database
		const { error: updateError } = await supabase
			.from('users')
			.update({ role_id: roleId })
			.eq('id', userId);

		if (updateError) {
			return {
				error: {
					status: 400,
					name: 'UpdateError',
					message: updateError.message
				}
			};
		}

		// Fetch the user's short_id first (userId is UUID)
		const { data: userRow, error: userRowError } = await supabase
			.from('users')
			.select('short_id')
			.eq('id', userId)
			.single();

		if (userRowError || !userRow) {
			return {
				error: {
					status: 500,
					name: 'UserDataError',
					message: 'Failed to fetch user'
				}
			};
		}

		// Fetch the updated enriched user data using short_id
		const { data: userData, error: userError } = await supabase.rpc('get_user_with_relations', {
			user_short_id: userRow.short_id
		});

		if (userError || !userData) {
			return {
				error: {
					status: 500,
					name: 'UserDataError',
					message: 'Failed to fetch updated user data'
				}
			};
		}

		return {
			data: adaptUserWithRelationsFromRpc(userData as unknown as UserWithRelationsRpcResponse)
		};
	} catch (error) {
		return {
			error: {
				status: 500,
				name: 'FetchError',
				message: 'Failed to update user'
			}
		};
	}
}

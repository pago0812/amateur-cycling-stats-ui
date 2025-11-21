import type { TypedSupabaseClient } from '$lib/types/db';
import type { User } from '$lib/types/domain';
import { adaptAuthUserFromRpc } from '$lib/adapters';

/**
 * Get the authenticated user's data (flattened domain type).
 * This function validates the session and returns enriched user data.
 * @param supabase - Supabase client instance with active session
 * @returns User (Admin | Organizer | Cyclist) or null if not authenticated
 * @throws Error if RPC fails (excluding authentication errors)
 */
export const getAuthUser = async (supabase: TypedSupabaseClient): Promise<User | null> => {
	try {
		// Call RPC without parameters (validates session internally)
		const { data: rpcResponse, error } = await supabase.rpc('get_auth_user');

		// Error code 28000 = no active session (expected for unauthenticated)
		if (error) {
			if (error.code === '28000') {
				return null; // Not authenticated
			}
			throw new Error(`RPC error: ${error.message}`);
		}

		// RPC returns array (RETURNS TABLE), check if empty
		if (!rpcResponse || rpcResponse.length === 0) {
			return null;
		}

		// Transform first row to domain type (auto-typed by Supabase!)
		return adaptAuthUserFromRpc(rpcResponse[0]);
	} catch (error) {
		console.error('Failed to get authenticated user:', error);
		throw error;
	}
};

/**
 * Get user by email with full relational data.
 * This function searches for a user by email and returns enriched user data.
 * @param supabase - Supabase client instance
 * @param email - User's email address
 * @returns User (Admin | Organizer | Cyclist) or null if not found
 * @throws Error if RPC fails (excluding not found errors)
 */
export const getUserByEmail = async (
	supabase: TypedSupabaseClient,
	email: string
): Promise<User | null> => {
	try {
		// Call RPC with email parameter
		const { data: rpcResponse, error } = await supabase.rpc('get_auth_user_by_email', {
			p_email: email
		});

		// Handle expected "not found" case
		if (error?.code === 'PGRST116' || !rpcResponse || rpcResponse.length === 0) {
			return null;
		}

		// Handle unexpected errors
		if (error) {
			const errorMessage =
				typeof error === 'object' && error && 'message' in error
					? String((error as { message: unknown }).message)
					: 'Unknown error';
			throw new Error(`RPC error: ${errorMessage}`);
		}

		// Transform first row to domain type (auto-typed by Supabase!)
		return adaptAuthUserFromRpc(rpcResponse[0]);
	} catch (error: unknown) {
		console.error('Failed to get user by email:', error);
		throw error;
	}
};

/**
 * Check if the current session is authenticated.
 * Simple helper to validate session without fetching full user data.
 * @param supabase - Supabase client instance
 * @returns true if authenticated, false otherwise
 */
export const isAuthenticated = async (supabase: TypedSupabaseClient): Promise<boolean> => {
	try {
		const { data, error } = await supabase.auth.getUser();
		return !error && data.user !== null;
	} catch {
		return false;
	}
};

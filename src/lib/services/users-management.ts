import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type {
	LoginRequest,
	SigninRequest,
	UserSessionResponse
} from '$lib/types/services/users-management';
import type { UserWithRelationsRpcResponse } from '$lib/types/db';
import { adaptUserWithRelationsFromRpc } from '$lib/adapters';
import { getAuthErrorMessage, t } from '$lib/i18n/server';

/**
 * Login with email and password using Supabase Auth.
 * @param supabase - Supabase client instance
 * @param credentials - Email and password
 * @param locale - User's locale for error messages (default: 'es')
 * @returns UserSessionResponse with session data or error
 */
export const login = async (
	supabase: SupabaseClient<Database>,
	{ email, password }: LoginRequest,
	locale: string = 'es'
): Promise<UserSessionResponse> => {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password
	});

	if (error) {
		// Get translated error message
		const userMessage = error.code ? getAuthErrorMessage(locale, error.code) : error.message;

		return {
			error: {
				status: error.status || 400,
				name: error.name || 'AuthError',
				message: userMessage
			}
		};
	}

	if (!data.session) {
		return {
			error: {
				status: 500,
				name: 'SessionError',
				message: t(locale, 'auth.errors.noSessionCreated')
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
				message: t(locale, 'auth.errors.userDataError')
			}
		};
	}

	return {
		data: {
			jwt: data.session.access_token,
			user: adaptUserWithRelationsFromRpc(userData as unknown as UserWithRelationsRpcResponse)
		}
	};
};

/**
 * Register a new user with email, password, first name, and last name.
 * The names are stored in user metadata and will be used to create the profile.
 * @param supabase - Supabase client instance
 * @param credentials - First name, last name (optional), email, and password
 * @param locale - User's locale for error messages (default: 'es')
 * @returns UserSessionResponse with session data or error
 */
export const signin = async (
	supabase: SupabaseClient<Database>,
	{ firstName, lastName, email, password }: SigninRequest,
	locale: string = 'es'
): Promise<UserSessionResponse> => {
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				first_name: firstName, // Store first_name in user metadata for the trigger to use
				last_name: lastName || null // Store last_name (optional)
			}
		}
	});

	if (error) {
		// Get translated error message
		const userMessage = error.code ? getAuthErrorMessage(locale, error.code) : error.message;

		return {
			error: {
				status: error.status || 400,
				name: error.name || 'AuthError',
				message: userMessage
			}
		};
	}

	if (!data.session || !data.user) {
		return {
			error: {
				status: 500,
				name: 'SessionError',
				message: t(locale, 'auth.errors.noSessionCreated')
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
				message: t(locale, 'auth.errors.userDataError')
			}
		};
	}

	return {
		data: {
			jwt: data.session.access_token,
			user: adaptUserWithRelationsFromRpc(userData as unknown as UserWithRelationsRpcResponse)
		}
	};
};

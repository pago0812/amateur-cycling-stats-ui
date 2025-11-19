/**
 * Auth Client API Service
 *
 * Provides authentication flows using Supabase client API.
 * These operations respect Row Level Security (RLS).
 */

import type { TypedSupabaseClient } from '$lib/types/db';
import type { LoginRequest, SigninRequest, AuthResponse } from '$lib/types/services';
import { getAuthErrorMessage, t } from '$lib/i18n/server';

/**
 * Login with email and password using Supabase Auth.
 * @param supabase - Supabase client instance
 * @param credentials - Email and password
 * @param locale - User's locale for error messages (default: 'es')
 * @returns AuthResponse with success flag or error
 */
export const login = async (
	supabase: TypedSupabaseClient,
	{ email, password }: LoginRequest,
	locale: string = 'es'
): Promise<AuthResponse> => {
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

	// Session created successfully - hooks.server.ts will fetch user data on next request
	return { success: true };
};

/**
 * Register a new user with email, password, first name, and last name.
 * The names are stored in user metadata and will be used to create the profile.
 * @param supabase - Supabase client instance
 * @param credentials - First name, last name (optional), email, and password
 * @param locale - User's locale for error messages (default: 'es')
 * @returns AuthResponse with success flag or error
 */
export const signin = async (
	supabase: TypedSupabaseClient,
	{ firstName, lastName, email, password }: SigninRequest,
	locale: string = 'es'
): Promise<AuthResponse> => {
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

	// Session created successfully - hooks.server.ts will fetch user data on next request
	return { success: true };
};

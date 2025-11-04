import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type {
	LoginRequest,
	SigninRequest,
	UserSessionResponse
} from '$lib/types/services/users-management';

/**
 * Login with email and password using Supabase Auth.
 * @param supabase - Supabase client instance
 * @param credentials - Email and password
 * @returns UserSessionResponse with session data or error
 */
export const login = async (
	supabase: SupabaseClient<Database>,
	{ email, password }: LoginRequest
): Promise<UserSessionResponse> => {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password
	});

	if (error) {
		// Log the raw Supabase error for debugging
		console.error('[SUPABASE LOGIN ERROR]', {
			code: error.code,
			message: error.message,
			status: error.status,
			name: error.name,
			fullError: error
		});

		// Map Supabase error codes to user-friendly Spanish messages
		let userMessage = error.message;

		// Use error.code for reliable error identification
		switch (error.code) {
			case 'invalid_credentials':
				userMessage = 'Email o contraseña incorrectos';
				break;
			case 'email_not_confirmed':
				userMessage = 'Por favor confirma tu email antes de iniciar sesión';
				break;
			case 'user_not_found':
				userMessage = 'Usuario no encontrado';
				break;
			case 'user_banned':
				userMessage = 'Esta cuenta ha sido suspendida';
				break;
			case 'over_request_rate_limit':
				userMessage = 'Demasiados intentos. Por favor intenta más tarde';
				break;
			default:
				// Keep original message for unknown errors
				userMessage = error.message;
		}

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
				message: 'No session created after login'
			}
		};
	}

	// Fetch enriched user data
	const { data: userData, error: userError } = await supabase.rpc('get_user_with_relations', {
		user_uuid: data.user.id
	});

	if (userError || !userData) {
		return {
			error: {
				status: 500,
				name: 'UserDataError',
				message: 'Failed to fetch user data after login'
			}
		};
	}

	return {
		data: {
			jwt: data.session.access_token,
			user: userData as any // Type assertion needed since RPC returns Json type
		}
	};
};

/**
 * Register a new user with email, password, and username.
 * The username is stored in user metadata and will be used to create the profile.
 * @param supabase - Supabase client instance
 * @param credentials - Username, email, and password
 * @returns UserSessionResponse with session data or error
 */
export const signin = async (
	supabase: SupabaseClient<Database>,
	{ username, email, password }: SigninRequest
): Promise<UserSessionResponse> => {
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				username // Store username in user metadata for the trigger to use
			}
		}
	});

	if (error) {
		// Map Supabase error codes to user-friendly Spanish messages
		let userMessage = error.message;

		// Use error.code for reliable error identification
		switch (error.code) {
			case 'email_exists':
				userMessage = 'Este email ya está registrado';
				break;
			case 'phone_exists':
				userMessage = 'Este teléfono ya está registrado';
				break;
			case 'weak_password':
				userMessage = 'La contraseña es muy débil. Usa al menos 6 caracteres';
				break;
			case 'signup_disabled':
				userMessage = 'El registro de nuevos usuarios está deshabilitado';
				break;
			case 'over_request_rate_limit':
				userMessage = 'Demasiados intentos. Por favor intenta más tarde';
				break;
			default:
				// Keep original message for unknown errors
				userMessage = error.message;
		}

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
				message: 'No session created after registration'
			}
		};
	}

	// Fetch enriched user data
	const { data: userData, error: userError } = await supabase.rpc('get_user_with_relations', {
		user_uuid: data.user.id
	});

	if (userError || !userData) {
		return {
			error: {
				status: 500,
				name: 'UserDataError',
				message: 'Failed to fetch user data after registration'
			}
		};
	}

	return {
		data: {
			jwt: data.session.access_token,
			user: userData as any // Type assertion needed since RPC returns Json type
		}
	};
};

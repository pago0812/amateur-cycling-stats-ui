import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type {
	LoginRequest,
	SigninRequest,
	AuthResponse
} from '$lib/types/services/users-management';
import type {
	CreateAuthUserForInvitationParams,
	CreateOrganizerOwnerUserParams,
	CreateUserResult
} from '$lib/types/services';
import { getAuthErrorMessage, t } from '$lib/i18n/server';
import { createSupabaseAdminClient } from '$lib/server/supabase';

/**
 * Login with email and password using Supabase Auth.
 * @param supabase - Supabase client instance
 * @param credentials - Email and password
 * @param locale - User's locale for error messages (default: 'es')
 * @returns AuthResponse with success flag or error
 */
export const login = async (
	supabase: SupabaseClient<Database>,
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
	supabase: SupabaseClient<Database>,
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

/**
 * Creates an auth user for invitation purposes (no password, email not confirmed).
 * Uses skip_auto_create flag to prevent automatic public.users creation.
 *
 * @param params - Email and optional metadata
 * @returns CreateUserResult with auth user ID or error
 */
export async function createAuthUserForInvitation(
	params: CreateAuthUserForInvitationParams
): Promise<CreateUserResult> {
	try {
		const adminClient = createSupabaseAdminClient();

		// Create auth user with skip_auto_create flag
		const { data, error } = await adminClient.auth.admin.createUser({
			email: params.email,
			email_confirm: false,
			user_metadata: {
				...params.metadata,
				skip_auto_create: true // Prevent automatic public.users creation
			}
		});

		if (error) {
			console.error('[Auth] Failed to create auth user for invitation:', error);
			return {
				success: false,
				error: error.message
			};
		}

		if (!data.user) {
			return {
				success: false,
				error: 'No user returned from auth.createUser'
			};
		}

		return {
			success: true,
			authUserId: data.user.id
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		console.error('[Auth] Error creating auth user for invitation:', errorMessage);
		return {
			success: false,
			error: errorMessage
		};
	}
}

/**
 * Creates or updates a user with organizer_owner role and links to organization.
 * Calls the Supabase RPC function create_user_with_organizer_owner.
 *
 * @param supabase - Supabase client instance
 * @param params - Auth user ID, names, and organization ID
 * @returns CreateUserResult with user ID or error
 */
export async function createOrganizerOwnerUser(
	supabase: SupabaseClient<Database>,
	params: CreateOrganizerOwnerUserParams
): Promise<CreateUserResult> {
	try {
		const { data, error } = await supabase.rpc('create_user_with_organizer_owner', {
			p_auth_user_id: params.authUserId,
			p_first_name: params.firstName,
			p_last_name: params.lastName,
			p_organization_id: params.organizationId
		});

		if (error) {
			console.error('[Users] Failed to create organizer owner user:', error);
			return {
				success: false,
				error: error.message
			};
		}

		return {
			success: true,
			userId: data,
			authUserId: params.authUserId
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		console.error('[Users] Error creating organizer owner user:', errorMessage);
		return {
			success: false,
			error: errorMessage
		};
	}
}

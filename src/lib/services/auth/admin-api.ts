/**
 * Auth Admin API Service
 *
 * Provides administrative authentication operations using Supabase Admin API.
 * WARNING: These operations bypass Row Level Security (RLS).
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type {
	CreateAuthUserForInvitationRequest,
	CreateOrganizerOwnerUserRequest,
	CreateUserResponse
} from '$lib/types/services';
import { createSupabaseAdminClient } from '$lib/server/supabase';

/**
 * Checks if a user exists by email address.
 *
 * @param email - Email address to check
 * @returns True if user exists, false otherwise
 */
export async function checkUserExists(email: string): Promise<boolean> {
	const adminClient = createSupabaseAdminClient();

	try {
		const { data, error } = await adminClient.auth.admin.listUsers();

		if (error) {
			console.error('[Auth Admin] Failed to list users:', error);
			// On error, return false to be safe
			return false;
		}

		// Check if any user has the given email
		return data.users.some((user) => user.email === email);
	} catch (error) {
		console.error('[Auth Admin] Exception during user existence check:', error);
		return false;
	}
}

export interface DeleteUserResult {
	success: boolean;
	error?: string;
}

/**
 * Deletes a user by their auth user ID using Supabase Admin API.
 * WARNING: This is a destructive operation that cannot be undone.
 * This will delete the user from auth.users and trigger CASCADE deletes.
 *
 * @param userId - Auth user ID to delete
 * @returns Result with success status or error
 */
export async function deleteAuthUserById(userId: string): Promise<DeleteUserResult> {
	const adminClient = createSupabaseAdminClient();

	try {
		const { error } = await adminClient.auth.admin.deleteUser(userId);

		if (error) {
			console.error('[Auth Admin] Failed to delete user:', error);
			return {
				success: false,
				error: error.message
			};
		}

		return {
			success: true
		};
	} catch (error) {
		console.error('[Auth Admin] Exception during user deletion:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

export interface GenerateInvitationLinkParams {
	email: string;
	redirectTo: string;
}

export interface GenerateInvitationLinkResult {
	success: boolean;
	actionLink?: string;
	error?: string;
}

/**
 * Generates an invitation link using magic link type.
 * Works for both initial invitations and resends.
 * Magic links work for existing unconfirmed users without throwing "user exists" errors.
 *
 * @param params - Email and redirect URL
 * @returns Result with invitation link or error
 */
export async function generateInvitationLink(
	params: GenerateInvitationLinkParams
): Promise<GenerateInvitationLinkResult> {
	const adminClient = createSupabaseAdminClient();

	try {
		const { data, error } = await adminClient.auth.admin.generateLink({
			type: 'magiclink',
			email: params.email,
			options: {
				redirectTo: params.redirectTo
			}
		});

		if (error) {
			console.error('[Auth Admin] Failed to generate invitation link:', error);
			return {
				success: false,
				error: error.message
			};
		}

		if (!data.properties?.action_link) {
			return {
				success: false,
				error: 'No action link returned from generateLink'
			};
		}

		return {
			success: true,
			actionLink: data.properties.action_link
		};
	} catch (error) {
		console.error('[Auth Admin] Exception during invitation link generation:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Creates an auth user for invitation purposes (no password, email not confirmed).
 * Uses skip_auto_create flag to prevent automatic public.users creation.
 *
 * @param params - Email and optional metadata
 * @returns CreateUserResult with auth user ID or error
 */
export async function createAuthUserForInvitation(
	params: CreateAuthUserForInvitationRequest
): Promise<CreateUserResponse> {
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
	params: CreateOrganizerOwnerUserRequest
): Promise<CreateUserResponse> {
	try {
		const { data, error } = await supabase.rpc('create_user_with_organizer_owner', {
			p_auth_user_id: params.authUserId,
			p_first_name: params.firstName,
			p_last_name: params.lastName,
			p_organization_id: params.organizationId
		});

		if (error) {
			console.error('[Auth Admin] Failed to create organizer owner user:', error);
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
		console.error('[Auth Admin] Error creating organizer owner user:', errorMessage);
		return {
			success: false,
			error: errorMessage
		};
	}
}

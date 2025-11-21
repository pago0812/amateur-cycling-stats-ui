/**
 * Auth Admin API Service
 *
 * Provides administrative authentication operations using Supabase Admin API.
 * WARNING: These operations bypass Row Level Security (RLS).
 */

import type { AuthUserDB, TypedSupabaseClient, OrganizerSetupResponseDB } from '$lib/types/db';
import type {
	CreateOnBehalfOrganizerOwnerRequest,
	CreateOnBehalfOrganizerOwnerResponse,
	CompleteOrganizerOwnerSetupRequest,
	SetupCompletionResponse
} from '$lib/types/services';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import { adaptOrganizerFromAuthUserRpc } from '$lib/adapters';

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
 * Creates an organizer owner user on behalf of admin (unified operation).
 * Combines auth user creation and public user/organizer creation in one function.
 * Returns the complete Organizer domain object.
 *
 * @param params - Email, first name, and organization ID
 * @returns Response with Organizer domain object or error
 */
export async function createOnBehalfOrganizerOwner(
	params: CreateOnBehalfOrganizerOwnerRequest
): Promise<CreateOnBehalfOrganizerOwnerResponse> {
	const adminClient = createSupabaseAdminClient();

	try {
		// Step 1: Create auth user with skip_auto_create flag
		const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
			email: params.email,
			email_confirm: false,
			user_metadata: {
				invitedOwnerName: params.firstName,
				organizationId: params.organizationId,
				skip_auto_create: true
			}
		});

		if (authError) {
			console.error('[Auth] Failed to create auth user for organizer owner:', authError);
			return {
				success: false,
				error: authError.message
			};
		}

		if (!authData.user) {
			return {
				success: false,
				error: 'No user returned from auth.createUser'
			};
		}

		const authUserId = authData.user.id;

		// Step 2: Create public user with organizer_owner role and link to organization
		// RPC returns complete AuthUserDB structure (flattened)
		const { data: organizerData, error: rpcError } = await adminClient.rpc(
			'create_user_with_organizer_owner',
			{
				p_auth_user_id: authUserId,
				p_first_name: params.firstName,
				p_last_name: params.firstName, // Use firstName for both names
				p_organization_id: params.organizationId
			}
		);

		if (rpcError) {
			console.error('[Auth] Failed to create organizer owner user via RPC:', rpcError);
			// TODO: Consider cleanup - delete auth user if RPC fails
			return {
				success: false,
				error: rpcError.message
			};
		}

		if (!organizerData) {
			return {
				success: false,
				error: 'No organizer data returned from RPC'
			};
		}

		// Adapt RPC response to Organizer domain type
		const organizer = adaptOrganizerFromAuthUserRpc(organizerData as unknown as AuthUserDB);

		return {
			success: true,
			organizer
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		console.error('[Auth] Error creating organizer owner on behalf of admin:', errorMessage);
		return {
			success: false,
			error: errorMessage
		};
	}
}

/**
 * Complete organizer owner setup after invitation acceptance.
 * Atomically updates user profile, links to organization, accepts invitation,
 * and activates organization. Password must be updated separately via Auth API.
 *
 * This function uses the authenticated user's session (not admin API) to ensure
 * proper RLS policy enforcement during setup.
 *
 * @param supabase - TypedSupabaseClient with user session
 * @param params - Setup completion parameters (authUserId, firstName, lastName, email)
 * @returns SetupCompletionResponse with organization and user IDs
 * @throws Error if setup fails or invitation not found
 */
export async function completeOrganizerOwnerSetup(
	supabase: TypedSupabaseClient,
	params: CompleteOrganizerOwnerSetupRequest
): Promise<SetupCompletionResponse> {
	const { data, error } = await supabase.rpc('complete_organizer_owner_setup', {
		p_auth_user_id: params.authUserId,
		p_first_name: params.firstName,
		p_last_name: params.lastName,
		p_invitation_email: params.email
	});

	if (error) {
		console.error('[Auth] Error completing organizer owner setup:', error);

		// P0002 = no_data_found - invitation not found
		if (error.code === 'P0002') {
			throw new Error(`No pending invitation found for email: ${params.email}`);
		}

		// 28000 = invalid_authorization_specification - organization not found
		if (error.code === '28000') {
			throw new Error('Organization not found for invitation');
		}

		throw new Error(`Error completing setup: ${error.message}`);
	}

	// RPC returns array from RETURNS TABLE, extract first element
	const result = data?.[0];
	if (!result) {
		throw new Error('No data returned after completing setup');
	}

	// Type cast to OrganizerSetupResponseDB and adapt to domain response type
	const setupResponse = result as OrganizerSetupResponseDB;

	return {
		success: setupResponse.success,
		organizationId: setupResponse.organization_id,
		userId: setupResponse.user_id
	};
}

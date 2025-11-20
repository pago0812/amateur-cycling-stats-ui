/**
 * Authentication Service Types
 *
 * Request and response types for authentication-related service functions.
 */

/**
 * Request parameters for completing organizer owner setup after invitation acceptance.
 * All fields are domain-typed (camelCase).
 */
export interface CompleteOrganizerOwnerSetupRequest {
	/** Auth user ID from Supabase Auth */
	authUserId: string;
	/** Owner's first name */
	firstName: string;
	/** Owner's last name */
	lastName: string;
	/** Owner's email address (must match invitation) */
	email: string;
}

/**
 * Response from completing organizer owner setup.
 * Contains IDs needed for redirect and confirmation.
 */
export interface SetupCompletionResponse {
	/** Whether setup completed successfully */
	success: boolean;
	/** ID of the activated organization */
	organizationId: string;
	/** ID of the created/updated user */
	userId: string;
}

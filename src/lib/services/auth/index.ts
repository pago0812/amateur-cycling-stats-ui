/**
 * Auth Service - Barrel Export
 *
 * Unified authentication service combining admin and client API operations.
 */

// Admin API operations (bypass RLS)
export {
	checkUserExists,
	deleteAuthUserById,
	generateInvitationLink,
	createOnBehalfOrganizerOwner,
	completeOrganizerOwnerSetup,
	type DeleteUserResult,
	type GenerateInvitationLinkParams,
	type GenerateInvitationLinkResult
} from './admin-api';

// Client API operations (respect RLS)
export { login, signin } from './client-api';

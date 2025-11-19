/**
 * Services
 *
 * Service layer for data operations and business logic.
 * All services are type-safe with no 'any' types.
 */

// Auth Admin
export { checkUserExists, deleteAuthUserById, generateInvitationLink } from './auth-admin';

// Cyclists
export { getCyclistById } from './cyclists';

// Events
export { getPastEvents, getFutureEvents, getEventWithRacesById } from './events';

// MailerSend
export { sendInvitationEmail } from './mailersend';

// Organization Invitations
export {
	createInvitation,
	getInvitationByEmail,
	getInvitationByOrganizationId,
	updateInvitationStatus,
	getPendingInvitationsForRetry,
	incrementRetryCount,
	deleteInvitationByOrganizationId
} from './organization-invitations';

// Organizations
export {
	getAllOrganizations,
	getOrganizationById,
	createOrganization,
	updateOrganization,
	updateOrganizationState,
	deleteOrganization,
	deactivateOrganization,
	activateOrganization,
	permanentlyDeleteOrganization
} from './organizations';

// Organizers
export { getOrganizersByOrganizationId, getOrganizersCountByOrganizationId } from './organizers';

// Race Results
export { getRaceResultsByUserId } from './race-results';

// Races
export { getRaceWithRaceResultsById } from './races';

// Roles
export { getRoles } from './roles';

// Users
export { getAuthUser, isAuthenticated, createUserWithRole, linkUserToOrganization } from './users';

// Users Management
export {
	login,
	signin,
	createAuthUserForInvitation,
	createOrganizerOwnerUser
} from './users-management';

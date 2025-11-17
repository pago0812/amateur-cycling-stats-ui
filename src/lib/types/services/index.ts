/**
 * Service Response Types
 *
 * These types represent structures returned by service methods and RPC functions.
 * They are aggregated/nested structures optimized for specific use cases,
 * not pure domain entities.
 */

// Event service response types
export type { EventWithRaces } from './events';

// Race service response types
export type { RaceWithRaceResults, RaceDetailResult } from './races';

// Organizer service response types (legacy - pending migration to flattened pattern)
export type { OrganizerWithRelations, UserWithRelations } from './organizers';

// Organization service types (request/response)
export type {
	GetOrganizationByIdParams,
	CreateOrganizationParams,
	UpdateOrganizationParams,
	UpdateOrganizationStateParams,
	DeleteOrganizationParams,
	DeactivateOrganizationParams,
	ActivateOrganizationParams,
	PermanentlyDeleteOrganizationParams
} from './organizations';

// MailerSend service types
export type {
	SendInvitationEmailParams,
	SendEmailResult,
	MailerSendEmailRequest,
	MailerSendApiResponse
} from './mailersend';

// User management service types (authentication)
export type { LoginRequest, SigninRequest, AuthResponse } from './users-management';

// User service types (user creation and linking)
export type {
	CreateAuthUserForInvitationParams,
	CreateOrganizerOwnerUserParams,
	CreateUserResult
} from './users';

// Role service types
export type { RolesResponse } from './roles';

// Error service types
export type { ServerError } from './errors';

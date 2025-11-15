/**
 * Service Types
 *
 * Request/Response types for the service layer.
 * These types represent API contracts and shouldn't be confused with domain types.
 */

// Error types
export type { ServerError } from './errors';

// User service types
export type {
	CreateAuthUserForInvitationParams,
	CreateOrganizerOwnerUserParams,
	CreateUserResult
} from './users';

// User management service types
export type { LoginRequest, SigninRequest, AuthResponse } from './users-management';

// Roles service types
export type { RolesResponse } from './roles';

// Organization service types
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

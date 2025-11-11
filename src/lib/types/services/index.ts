/**
 * Service Types
 *
 * Request/Response types for the service layer.
 * These types represent API contracts and shouldn't be confused with domain types.
 */

// Error types
export type { ServerError } from './errors';

// User service types
export type { SetRoleRequest, UserResponse } from './users';

// User management service types
export type {
	LoginRequest,
	SigninRequest,
	UserSession,
	UserSessionResponse
} from './users-management';

// Roles service types
export type { RolesResponse } from './roles';

// Organization service types
export type {
	GetOrganizationByIdParams,
	CreateOrganizationParams,
	UpdateOrganizationParams,
	DeleteOrganizationParams
} from './organizations';

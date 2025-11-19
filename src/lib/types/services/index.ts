/**
 * Service Types
 *
 * These types represent structures used by service methods:
 * - Request types: Parameters for service function calls
 * - Response types: Aggregated/nested structures returned by services and RPCs
 * - Error types: Standardized error structures
 *
 * Response types are created when:
 * 1. Aggregating multiple domain entities (e.g., EventWithRaces)
 * 2. Returning RPC function results with complex nested data
 * 3. Optimizing for specific use cases that differ from domain structure
 */

// ============================================================================
// Event Service Types
// ============================================================================
export type { EventWithRaces } from './events';

// ============================================================================
// Race Service Types
// ============================================================================
export type { RaceWithRaceResults, RaceDetailResult } from './races';

// ============================================================================
// Organization Service Types
// ============================================================================
export type {
	OrganizationIdRequest,
	CreateOrganizationRequest,
	UpdateOrganizationRequest,
	UpdateOrganizationStateRequest
} from './organizations';

// ============================================================================
// User Service Types
// ============================================================================
export type {
	CreateOnBehalfOrganizerOwnerRequest,
	CreateOnBehalfOrganizerOwnerResponse
} from './users';

// ============================================================================
// User Management Service Types (Authentication)
// ============================================================================
export type { LoginRequest, SigninRequest, AuthResponse } from './users-management';

// ============================================================================
// MailerSend Service Types
// ============================================================================
export type {
	SendInvitationEmailRequest,
	SendEmailResponse,
	MailerSendEmailRequest,
	MailerSendApiResponse
} from './mailersend';

// ============================================================================
// Role Service Types
// ============================================================================
export type { GetRolesResponse } from './roles';

// ============================================================================
// Organizer Service Types (Legacy - Pending Migration)
// ============================================================================
// These types use nested relationships and will be migrated to flattened pattern.
// DO NOT use in new code - use domain types + parallel fetching instead.
export type { OrganizerWithRelations, UserWithRelations } from './organizers';

// ============================================================================
// Error Types
// ============================================================================
export type { ServerError, ValidationError, ApiError } from './errors';

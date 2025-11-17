import type { OrganizationState } from '../domain/organization.domain';

// ============================================================================
// Request Types
// ============================================================================

/**
 * Identifies an organization by UUID.
 * Used by: getById, delete, deactivate, activate, permanentlyDelete operations.
 */
export interface OrganizationIdRequest {
	id: string;
}

export interface CreateOrganizationRequest {
	name: string;
	description?: string | null;
	state?: OrganizationState;
}

export interface UpdateOrganizationRequest {
	id: string;
	name?: string;
	description?: string | null;
}

export interface UpdateOrganizationStateRequest {
	id: string;
	state: OrganizationState;
}

// ============================================================================
// Response Types
// ============================================================================

// None needed - service returns domain Organization type directly

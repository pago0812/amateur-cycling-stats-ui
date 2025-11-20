import type { OrganizationState } from '../domain/organization.domain';

// ============================================================================
// Request Types
// ============================================================================

/**
 * Identifies an organization by UUID.
 * Used by: getById, delete, permanentlyDelete operations.
 */
export interface OrganizationIdRequest {
	id: string;
}

export interface CreateOrganizationRequest {
	name: string;
	description?: string | null;
	state?: OrganizationState;
}

// ============================================================================
// Response Types
// ============================================================================

// None needed - service returns domain Organization type directly

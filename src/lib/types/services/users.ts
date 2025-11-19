import type { Organizer } from '$lib/types/domain';

// ============================================================================
// Request Types
// ============================================================================

export interface CreateOnBehalfOrganizerOwnerRequest {
	email: string;
	firstName: string;
	organizationId: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface CreateOnBehalfOrganizerOwnerResponse {
	success: boolean;
	organizer?: Organizer;
	error?: string;
}

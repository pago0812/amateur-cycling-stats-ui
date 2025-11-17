// ============================================================================
// Request Types
// ============================================================================

export interface CreateAuthUserForInvitationRequest {
	email: string;
	metadata?: {
		invitedOwnerName?: string;
		organizationId?: string;
		skip_auto_create?: boolean;
	};
}

export interface CreateOrganizerOwnerUserRequest {
	authUserId: string;
	firstName: string;
	lastName: string;
	organizationId: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface CreateUserResponse {
	success: boolean;
	userId?: string;
	authUserId?: string;
	error?: string;
}

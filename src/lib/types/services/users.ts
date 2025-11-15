// Requests
export interface CreateAuthUserForInvitationParams {
	email: string;
	metadata?: {
		invitedOwnerName?: string;
		organizationId?: string;
		[key: string]: unknown;
	};
}

export interface CreateOrganizerOwnerUserParams {
	authUserId: string;
	firstName: string;
	lastName: string;
	organizationId: string;
}

// Responses
export interface CreateUserResult {
	success: boolean;
	userId?: string;
	authUserId?: string;
	error?: string;
}

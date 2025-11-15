import type { UserWithRelations } from '../domain';
import type { ServerError } from './errors';

// Requests
export interface SetRoleRequest {
	userId: string;
	roleId: string;
}

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

export interface CreateOrganizerStaffUserParams {
	authUserId: string;
	firstName: string;
	lastName: string;
	organizationId: string;
}

export interface CreateCyclistUserParams {
	authUserId: string;
	firstName: string;
	lastName: string;
}

// Responses
export interface UserResponse {
	data?: UserWithRelations;
	error?: ServerError;
}

export interface CreateUserResult {
	success: boolean;
	userId?: string;
	authUserId?: string;
	error?: string;
}

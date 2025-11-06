import type { User } from '../domain';
import type { ServerError } from './errors';

// Requests
export interface SetRoleRequest {
	userId: string;
	roleId: string;
}

// Responses
export interface UserResponse {
	data?: User;
	error?: ServerError;
}

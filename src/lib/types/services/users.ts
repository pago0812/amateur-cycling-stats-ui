import type { User } from '../entities/users';
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

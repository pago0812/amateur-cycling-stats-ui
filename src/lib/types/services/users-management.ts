import type { User } from '../domain';
import type { ServerError } from './errors';

// Requests
export interface LoginRequest {
	email: string;
	password: string;
}

export interface SigninRequest {
	firstName: string;
	lastName?: string;
	email: string;
	password: string;
}

// Responses
export interface AuthResponse {
	success?: boolean;
	error?: ServerError;
}

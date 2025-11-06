import type { User } from '../domain';
import type { ServerError } from './errors';

// Requests
export interface LoginRequest {
	email: string;
	password: string;
}

export interface SigninRequest {
	username: string;
	email: string;
	password: string;
}

// Responses
export interface UserSession {
	jwt: string;
	user: User;
}

export interface UserSessionResponse {
	data?: UserSession;
	error?: ServerError;
}

import type { ServerError } from './errors';

// ============================================================================
// Request Types
// ============================================================================

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

// ============================================================================
// Response Types
// ============================================================================

export interface AuthResponse {
	success?: boolean;
	error?: ServerError;
}

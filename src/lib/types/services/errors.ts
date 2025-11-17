// ============================================================================
// Error Types
// ============================================================================

/**
 * Standard server error structure used across all service responses.
 * Provides consistent error handling for HTTP-style errors.
 */
export interface ServerError {
	status: number;
	name: string;
	message: string;
}

/**
 * Validation error with field-level error details.
 * Extends ServerError with structured field validation failures.
 */
export interface ValidationError extends ServerError {
	fields?: Record<string, string[]>;
}

/**
 * API error with optional error code for client handling.
 * Extends ServerError with API-specific error codes.
 */
export interface ApiError extends ServerError {
	code?: string;
}

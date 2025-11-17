import type { Role } from '../domain';
import type { ServerError } from './errors';

// ============================================================================
// Response Types
// ============================================================================

export interface GetRolesResponse {
	data?: { roles: Role[] };
	error?: ServerError;
}

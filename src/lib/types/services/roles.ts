import type { Role } from '../entities/roles';
import type { ServerError } from './errors';

export interface RolesResponse {
	data?: { roles: Role[] };
	error?: ServerError;
}

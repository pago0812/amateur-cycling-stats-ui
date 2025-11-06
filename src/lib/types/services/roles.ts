import type { Role } from '../domain';
import type { ServerError } from './errors';

export interface RolesResponse {
	data?: { roles: Role[] };
	error?: ServerError;
}

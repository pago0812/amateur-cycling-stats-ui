import type { Role } from './roles';

export interface User {
	id: string;
	documentId: string;
	username: string;
	email: string;
	password: number;
	role?: Role;
}

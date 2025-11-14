// Organization service request types

import type { OrganizationState } from '../domain/organization.domain';

export interface GetOrganizationByIdParams {
	id: string;
}

export interface CreateOrganizationParams {
	name: string;
	description?: string | null;
	state?: OrganizationState;
}

export interface UpdateOrganizationParams {
	id: string;
	name?: string;
	description?: string | null;
}

export interface UpdateOrganizationStateParams {
	id: string;
	state: OrganizationState;
}

export interface DeleteOrganizationParams {
	id: string;
}

export interface DeactivateOrganizationParams {
	id: string;
}

export interface ActivateOrganizationParams {
	id: string;
}

export interface PermanentlyDeleteOrganizationParams {
	id: string;
}

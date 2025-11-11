// Organization service request types

export interface GetOrganizationByIdParams {
	id: string;
}

export interface CreateOrganizationParams {
	name: string;
	description?: string | null;
}

export interface UpdateOrganizationParams {
	id: string;
	name?: string;
	description?: string | null;
}

export interface DeleteOrganizationParams {
	id: string;
}

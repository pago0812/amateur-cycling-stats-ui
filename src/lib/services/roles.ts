import type { RolesResponse } from '$lib/types/services/roles';

export const getRoles = async (jwt: string): Promise<RolesResponse> => {
	try {
		const rolesResponse = await fetch(
			`${import.meta.env.VITE_SERVICE_URL}/api/users-permissions/roles`,
			{
				headers: {
					Authorization: `Bearer ${jwt}`
				},
				cache: 'no-store'
			}
		);

		if (rolesResponse.ok) {
			return { data: await rolesResponse.json() };
		}

		return await rolesResponse.json();
	} catch (error) {
		return {
			error: {
				status: 500,
				name: 'FetchError',
				message: 'Failed to fetch roles'
			}
		};
	}
};

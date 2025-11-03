import qs from 'qs';
import type { SetRoleRequest, UserResponse } from '$lib/types/services/users';

export const getMyself = async (jwt: string): Promise<UserResponse> => {
	const query = {
		populate: 'role'
	};

	const queryString = qs.stringify(query);

	try {
		const myselfResponse = await fetch(
			`${import.meta.env.VITE_SERVICE_URL}/api/users/me?${queryString}`,
			{
				headers: {
					Authorization: `Bearer ${jwt}`
				},
				cache: 'no-store'
			}
		);

		if (myselfResponse.ok) {
			return { data: await myselfResponse.json() };
		}

		return await myselfResponse.json();
	} catch (error) {
		return {
			error: {
				status: 500,
				name: 'FetchError',
				message: 'Failed to fetch user'
			}
		};
	}
};

export const updateUser = async (
	jwt: string,
	{ roleId, userId }: SetRoleRequest
): Promise<UserResponse> => {
	const body = {
		role: roleId
	};

	try {
		const updateUserResponse = await fetch(
			`${import.meta.env.VITE_SERVICE_URL}/api/users/${userId}`,
			{
				method: 'PUT',
				headers: {
					'Content-type': 'application/json',
					Authorization: `Bearer ${jwt}`
				},
				body: JSON.stringify(body)
			}
		);

		if (updateUserResponse.ok) {
			return { data: await updateUserResponse.json() };
		}

		return await updateUserResponse.json();
	} catch (error) {
		return {
			error: {
				status: 500,
				name: 'FetchError',
				message: 'Failed to update user'
			}
		};
	}
};

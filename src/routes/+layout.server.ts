import { getJWT } from '$lib/utils/session';
import { getMyself } from '$lib/services/users';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const jwt = getJWT(cookies);

	if (!jwt) {
		return {
			user: null
		};
	}

	const userResponse = await getMyself(jwt);

	if (userResponse.error || !userResponse.data) {
		return {
			user: null
		};
	}

	return {
		user: userResponse.data
	};
};

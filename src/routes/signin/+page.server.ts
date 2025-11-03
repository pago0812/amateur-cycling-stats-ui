import { fail, redirect } from '@sveltejs/kit';
import { signin } from '$lib/services/users-management';
import { saveJWT, getJWT } from '$lib/utils/session';
import { Urls } from '$lib/constants/urls';
import type { Actions, PageServerLoad } from './$types';
import { getMyself } from '$lib/services/users';

export const load: PageServerLoad = async ({ cookies }) => {
	// Redirect if already logged in
	const jwt = getJWT(cookies);
	if (jwt) {
		const user = await getMyself(jwt);
		if (user.data) {
			throw redirect(302, Urls.PORTAL);
		}
	}
};

export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = formData.get('username')?.toString() || '';
		const email = formData.get('email')?.toString() || '';
		const password = formData.get('password')?.toString() || '';

		if (!username || !email || !password) {
			return fail(400, {
				error: 'All fields are required',
				username,
				email
			});
		}

		const signinResponse = await signin({ username, email, password });

		if (signinResponse.error) {
			return fail(400, {
				error: signinResponse.error.message,
				username,
				email
			});
		}

		if (signinResponse.data) {
			saveJWT(cookies, signinResponse.data.jwt);
			throw redirect(302, Urls.PORTAL);
		}

		return fail(500, {
			error: 'Unexpected error occurred',
			username,
			email
		});
	}
} satisfies Actions;

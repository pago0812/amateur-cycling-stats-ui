import { fail, redirect } from '@sveltejs/kit';
import { login } from '$lib/services/users-management';
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
		const email = formData.get('email')?.toString() || '';
		const password = formData.get('password')?.toString() || '';

		if (!email || !password) {
			return fail(400, {
				error: 'Email and password are required',
				email
			});
		}

		const loginResponse = await login({ email, password });

		if (loginResponse.error) {
			return fail(400, {
				error: loginResponse.error.message,
				email
			});
		}

		if (loginResponse.data) {
			saveJWT(cookies, loginResponse.data.jwt);
			throw redirect(302, Urls.PORTAL);
		}

		return fail(500, {
			error: 'Unexpected error occurred',
			email
		});
	}
} satisfies Actions;

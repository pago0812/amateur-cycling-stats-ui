import { fail, redirect } from '@sveltejs/kit';
import { login } from '$lib/services/users-management';
import { Urls } from '$lib/constants/urls';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect if already logged in
	const { user } = await locals.safeGetSession();
	if (user) {
		throw redirect(302, Urls.PORTAL);
	}
};

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString() || '';
		const password = formData.get('password')?.toString() || '';

		if (!email || !password) {
			return fail(400, {
				error: 'Email and password are required',
				email
			});
		}

		// Login using Supabase Auth (cookies are automatically managed by Supabase)
		const loginResponse = await login(locals.supabase, { email, password });

		if (loginResponse.error) {
			console.error('[LOGIN ERROR]', {
				status: loginResponse.error.status,
				name: loginResponse.error.name,
				message: loginResponse.error.message,
				fullError: loginResponse.error
			});
			return fail(400, {
				error: loginResponse.error.message,
				email
			});
		}

		if (loginResponse.data) {
			// No need to manually save JWT - Supabase handles cookies automatically
			throw redirect(302, Urls.PORTAL);
		}

		return fail(500, {
			error: 'Unexpected error occurred',
			email
		});
	}
} satisfies Actions;

import { fail, redirect } from '@sveltejs/kit';
import { signin } from '$lib/services/users-management';
import { Urls } from '$lib/constants/urls';
import { t } from '$lib/i18n/server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	// Get user from parent layout
	const { user } = await parent();

	// Redirect if already logged in
	if (user) {
		throw redirect(302, Urls.ACCOUNT);
	}
};

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString() || '';
		const email = formData.get('email')?.toString() || '';
		const password = formData.get('password')?.toString() || '';

		if (!name || !email || !password) {
			return fail(400, {
				error: t(locals.locale, 'auth.errors.allFieldsRequired'),
				name,
				email
			});
		}

		// Register using Supabase Auth (cookies are automatically managed by Supabase)
		const signinResponse = await signin(
			locals.supabase,
			{ firstName: name, email, password },
			locals.locale
		);

		if (signinResponse.error) {
			return fail(400, {
				error: signinResponse.error.message,
				name,
				email
			});
		}

		if (signinResponse.success) {
			// No need to manually save JWT - Supabase handles cookies automatically
			// Redirect cyclists to /account (all new users are cyclists by default)
			throw redirect(302, Urls.ACCOUNT);
		}

		return fail(500, {
			error: 'Unexpected error occurred',
			name,
			email
		});
	}
} satisfies Actions;

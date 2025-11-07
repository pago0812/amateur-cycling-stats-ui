import { fail, redirect } from '@sveltejs/kit';
import { login } from '$lib/services/users-management';
import { Urls } from '$lib/constants/urls';
import { t } from '$lib/i18n/server';
import { RoleTypeEnum } from '$lib/types/domain';
import type { Actions, PageServerLoad } from './$types';

/**
 * Helper function to determine redirect URL based on user role
 */
function getRedirectUrlForRole(roleName?: string): string {
	if (!roleName) return Urls.LOGIN;

	// Cyclists go to /account
	if (roleName === RoleTypeEnum.CYCLIST) {
		return Urls.ACCOUNT;
	}

	// Organizers and admins go to /panel
	if (
		roleName === RoleTypeEnum.ORGANIZER_ADMIN ||
		roleName === RoleTypeEnum.ORGANIZER_STAFF ||
		roleName === RoleTypeEnum.ADMIN
	) {
		return Urls.PANEL;
	}

	// Default to login for unknown roles
	return Urls.LOGIN;
}

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect if already logged in
	const { user } = await locals.safeGetSession();
	if (user) {
		throw redirect(302, getRedirectUrlForRole(user.role?.name));
	}
};

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString() || '';
		const password = formData.get('password')?.toString() || '';

		if (!email || !password) {
			return fail(400, {
				error: t(locals.locale, 'auth.errors.emailPasswordRequired'),
				email
			});
		}

		// Login using Supabase Auth (cookies are automatically managed by Supabase)
		const loginResponse = await login(locals.supabase, { email, password }, locals.locale);

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
			// Fetch user data to determine role-based redirect
			const { user } = await locals.safeGetSession();
			throw redirect(302, getRedirectUrlForRole(user?.role?.name));
		}

		return fail(500, {
			error: 'Unexpected error occurred',
			email
		});
	}
} satisfies Actions;

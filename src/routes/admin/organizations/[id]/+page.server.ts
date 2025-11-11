import { redirect } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { deleteOrganization } from '$lib/services/organizations';
import { t } from '$lib/i18n/server';

export const actions: Actions = {
	delete: async ({ params, locals }) => {
		// Layout already ensures user is authenticated and has ADMIN role
		try {
			// Soft delete organization (sets is_active = false)
			await deleteOrganization(locals.supabase, { id: params.id });
		} catch (err) {
			// Log error and return user-friendly message
			console.error('Error deleting organization:', err);
			return fail(500, {
				error: t(locals.locale, 'admin.organizations.errors.deleteFailed')
			});
		}

		// Redirect to organizations list (outside try-catch so it's not caught as error)
		throw redirect(303, '/admin/organizations');
	}
};

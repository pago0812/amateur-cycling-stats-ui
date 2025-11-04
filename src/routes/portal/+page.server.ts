import { redirect, fail } from '@sveltejs/kit';
import { updateUser } from '$lib/services/users';
import { getRoles } from '$lib/services/roles';
import { Urls } from '$lib/constants/urls';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Get user from session (via hooks)
	const { user } = await locals.safeGetSession();

	if (!user) {
		throw redirect(302, Urls.LOGIN);
	}

	return {
		user
	};
};

export const actions = {
	updateRole: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();

		if (!user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const roleType = formData.get('roleType')?.toString();

		if (!roleType) {
			return fail(400, { error: 'Role type is required' });
		}

		// Get available roles
		const rolesResponse = await getRoles(locals.supabase);
		if (rolesResponse.error) {
			return fail(400, { error: rolesResponse.error.message });
		}

		// Find the role by type
		const role = rolesResponse.data?.roles.find((r) => r.type === roleType);
		if (!role) {
			return fail(400, { error: 'Role does not exist' });
		}

		// Update user role
		const updateRoleResponse = await updateUser(locals.supabase, {
			userId: user.id,
			roleId: role.id
		});

		if (updateRoleResponse.error) {
			return fail(400, { error: updateRoleResponse.error.message });
		}

		// Return success - the page will reload and show updated user
		return { success: true };
	},

	logout: async ({ locals }) => {
		// Sign out using Supabase Auth (automatically clears cookies)
		await locals.supabase.auth.signOut();
		throw redirect(302, Urls.HOME);
	}
} satisfies Actions;

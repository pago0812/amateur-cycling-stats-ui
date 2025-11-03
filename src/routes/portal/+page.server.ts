import { redirect, fail } from '@sveltejs/kit';
import { getMyself, updateUser } from '$lib/services/users';
import { getRoles } from '$lib/services/roles';
import { getJWT, revokeJWT } from '$lib/utils/session';
import { Urls } from '$lib/constants/urls';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const jwt = getJWT(cookies);

	if (!jwt) {
		throw redirect(302, Urls.LOGIN);
	}

	const user = await getMyself(jwt);

	if (user.error) {
		throw redirect(302, Urls.LOGIN);
	}

	return {
		user: user.data
	};
};

export const actions = {
	updateRole: async ({ request, cookies }) => {
		const jwt = getJWT(cookies);

		if (!jwt) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const roleType = formData.get('roleType')?.toString();

		if (!roleType) {
			return fail(400, { error: 'Role type is required' });
		}

		// Get current user
		const userResponse = await getMyself(jwt);
		if (userResponse.error) {
			return fail(400, { error: userResponse.error.message });
		}

		// Get available roles
		const rolesResponse = await getRoles(jwt);
		if (rolesResponse.error) {
			return fail(400, { error: rolesResponse.error.message });
		}

		// Find the role by type
		const role = rolesResponse.data?.roles.find((r) => r.type === roleType);
		if (!role || !role.documentId) {
			return fail(400, { error: 'Role does not exist' });
		}

		// Update user role
		const updateRoleResponse = await updateUser(jwt, {
			userId: userResponse.data?.id,
			roleId: role.id
		});

		if (updateRoleResponse.error) {
			return fail(400, { error: updateRoleResponse.error.message });
		}

		// Return success - the page will reload and show updated user
		return { success: true };
	},

	logout: async ({ cookies }) => {
		revokeJWT(cookies);
		throw redirect(302, Urls.HOME);
	}
} satisfies Actions;

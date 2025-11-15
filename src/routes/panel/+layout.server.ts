import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { Urls } from '$lib/constants/urls';
import { RoleTypeEnum } from '$lib/types/domain';

export const load: LayoutServerLoad = async ({ parent }) => {
	// Get user from parent layout (already fetched in root layout)
	const { user } = await parent();

	// Require authentication
	if (!user) {
		throw redirect(302, Urls.LOGIN);
	}

	// Redirect cyclists to /account
	if (user.roleType === RoleTypeEnum.CYCLIST) {
		throw redirect(302, Urls.ACCOUNT);
	}

	// Redirect admins to /admin
	if (user.roleType === RoleTypeEnum.ADMIN) {
		throw redirect(302, Urls.ADMIN);
	}

	// Ensure user is organizer
	if (
		user.roleType !== RoleTypeEnum.ORGANIZER_OWNER &&
		user.roleType !== RoleTypeEnum.ORGANIZER_STAFF
	) {
		throw redirect(302, Urls.LOGIN);
	}

	return {
		user
	};
};

import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { Urls } from '$lib/constants/urls';
import { RoleTypeEnum } from '$lib/types/domain';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();

	// Require authentication
	if (!user) {
		throw redirect(302, Urls.LOGIN);
	}

	// Only cyclists can access /account
	// Redirect organizers and admins to /panel
	if (
		user.role?.name === RoleTypeEnum.ORGANIZER_ADMIN ||
		user.role?.name === RoleTypeEnum.ORGANIZER_STAFF ||
		user.role?.name === RoleTypeEnum.ADMIN
	) {
		throw redirect(302, Urls.PANEL);
	}

	// Ensure user has cyclist role
	if (user.role?.name !== RoleTypeEnum.CYCLIST) {
		throw redirect(302, Urls.LOGIN);
	}

	return {
		user
	};
};

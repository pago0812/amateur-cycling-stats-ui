import { redirect } from '@sveltejs/kit';
import { Urls } from '$lib/constants/urls';
import { RoleTypeEnum } from '$lib/types/domain';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();

	// Redirect unauthenticated users to login
	if (!user) {
		throw redirect(302, Urls.LOGIN);
	}

	// Redirect cyclists to account page
	if (user.role?.name === RoleTypeEnum.CYCLIST) {
		throw redirect(302, Urls.ACCOUNT);
	}

	// Redirect organizers to panel
	if (
		user.role?.name === RoleTypeEnum.ORGANIZER_ADMIN ||
		user.role?.name === RoleTypeEnum.ORGANIZER_STAFF
	) {
		throw redirect(302, Urls.PANEL);
	}

	// Only admins can access this route
	if (user.role?.name !== RoleTypeEnum.ADMIN) {
		throw redirect(302, Urls.HOME);
	}

	return {
		user
	};
};

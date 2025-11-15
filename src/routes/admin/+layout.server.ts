import { redirect } from '@sveltejs/kit';
import { Urls } from '$lib/constants/urls';
import { RoleTypeEnum } from '$lib/types/domain';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();

	console.log('user: ', user);

	// Redirect unauthenticated users to login
	if (!user) {
		throw redirect(302, Urls.LOGIN);
	}

	// Redirect cyclists to account page
	if (user.roleType === RoleTypeEnum.CYCLIST) {
		throw redirect(302, Urls.ACCOUNT);
	}

	// Redirect organizers to panel
	if (
		user.roleType === RoleTypeEnum.ORGANIZER_OWNER ||
		user.roleType === RoleTypeEnum.ORGANIZER_STAFF
	) {
		throw redirect(302, Urls.PANEL);
	}

	// Only admins can access this route
	if (user.roleType !== RoleTypeEnum.ADMIN) {
		throw redirect(302, Urls.HOME);
	}

	return {
		user
	};
};

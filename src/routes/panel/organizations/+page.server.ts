import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { Urls } from '$lib/constants/urls';
import { RoleTypeEnum } from '$lib/types/domain';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();

	// Only admins can access this page
	if (user?.role?.name !== RoleTypeEnum.ADMIN) {
		throw redirect(302, Urls.PANEL);
	}

	// TODO: Fetch all organizations
	return {};
};

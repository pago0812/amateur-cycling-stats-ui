import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { Urls } from '$lib/constants/urls';
import { RoleTypeEnum } from '$lib/types/domain';
import { getOrganizationById } from '$lib/services';

export const load: LayoutServerLoad = async ({ parent, locals }) => {
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

	// Fetch organization using the organizationId from flattened Organizer type
	const organization = await getOrganizationById(locals.supabase, {
		id: user.organizationId
	});

	if (!organization) {
		// Organizer doesn't have an organization linked - shouldn't happen
		console.error('Organizer user has no organization');
		throw error(404, 'Organization not found');
	}

	return {
		user,
		organization
	};
};

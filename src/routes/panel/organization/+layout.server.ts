import { error } from '@sveltejs/kit';
import { getOrganizationById } from '$lib/services/organizations';
import type { LayoutServerLoad } from './$types';
import { RoleTypeEnum } from '$lib/types/domain';

export const load: LayoutServerLoad = async ({ parent, locals }) => {
	// Get user from parent layout
	const { user } = await parent();

	// Ensure user is an organizer (parent layout already checks this)
	if (
		user.roleType !== RoleTypeEnum.ORGANIZER_OWNER &&
		user.roleType !== RoleTypeEnum.ORGANIZER_STAFF
	) {
		throw error(403, 'Access denied');
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

	return { organization };
};

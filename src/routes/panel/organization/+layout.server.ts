import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ parent }) => {
	// Get user from parent layout
	const { user } = await parent();

	// Get organization from user's organizer relationship
	// The get_user_with_relations RPC already fetches and returns the organization
	const organization = user.organizer?.organization ?? null;

	if (!organization) {
		// Organizer doesn't have an organization linked - shouldn't happen
		console.error('Organizer user has no organization');
	}

	return { organization };
};

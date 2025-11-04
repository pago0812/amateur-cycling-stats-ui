import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Get user from session (via hooks)
	const { user } = await locals.safeGetSession();

	return {
		user
	};
};

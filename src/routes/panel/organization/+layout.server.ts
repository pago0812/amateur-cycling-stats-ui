import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ parent }) => {
	// Get user from parent layout
	const { organization } = await parent();

	return { organization };
};

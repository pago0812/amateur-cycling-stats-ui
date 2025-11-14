import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	// Get error type from URL params
	const errorType = url.searchParams.get('error') || 'unknown';

	return {
		errorType
	};
};

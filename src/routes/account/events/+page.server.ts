import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// TODO: Fetch upcoming events that user is registered for
	return {
		events: []
	};
};

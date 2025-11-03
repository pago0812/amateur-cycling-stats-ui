import { getPastEvents } from '$lib/services/events';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const year = url.searchParams.get('year') || undefined;

	try {
		const events = await getPastEvents({ year });
		return {
			events
		};
	} catch (error) {
		console.error('Error loading past events:', error);
		return {
			events: [],
			error: 'Failed to load events'
		};
	}
};

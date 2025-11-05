import { getFutureEvents } from '$lib/services/events';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		const events = await getFutureEvents(locals.supabase);
		return {
			events
		};
	} catch (error) {
		console.error('Error loading future events:', error);
		return {
			events: [],
			error: 'Failed to load events'
		};
	}
};

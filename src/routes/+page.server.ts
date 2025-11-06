import { getFutureEvents } from '$lib/services/events';
import type { PageServerLoad } from './$types';
import type { Event } from '$lib/types/domain';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		const events = await getFutureEvents(locals.supabase);
		return {
			events,
			error: ''
		};
	} catch (error) {
		console.error('Error loading future events:', error);
		return {
			events: [] as Event[],
			error: 'Failed to load events'
		};
	}
};

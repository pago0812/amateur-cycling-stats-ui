import type { PageServerLoad, Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { getEventById, updateEvent, deleteEvent } from '$lib/services/events';

export const load: PageServerLoad = async ({ locals, parent, params }) => {
	await parent(); // Ensure user is authenticated organizer

	const event = await getEventById(locals.supabase, { id: params.id });

	if (!event) {
		throw error(404, 'Event not found');
	}

	return {
		event
	};
};

export const actions: Actions = {
	toggleVisibility: async ({ locals, params }) => {
		const event = await getEventById(locals.supabase, { id: params.id });
		if (!event) {
			throw error(404, 'Event not found');
		}

		await updateEvent(locals.supabase, params.id, {
			isPublicVisible: !event.isPublicVisible
		});

		return { success: true };
	},

	delete: async ({ locals, params }) => {
		await deleteEvent(locals.supabase, { id: params.id });
		throw redirect(303, '/panel/events');
	}
};

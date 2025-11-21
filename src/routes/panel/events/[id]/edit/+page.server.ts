import type { PageServerLoad, Actions } from './$types';
import { error, redirect, fail } from '@sveltejs/kit';
import { getEventById, updateEvent } from '$lib/services/events';

export const load: PageServerLoad = async ({ locals, parent, params }) => {
	await parent();

	const event = await getEventById(locals.supabase, { id: params.id });

	if (!event) {
		throw error(404, 'Event not found');
	}

	return {
		event
	};
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		const formData = await request.formData();

		const name = formData.get('name')?.toString() ?? '';
		const description = formData.get('description')?.toString() || null;
		const dateTime = formData.get('dateTime')?.toString() ?? '';
		const country = formData.get('country')?.toString() ?? '';
		const state = formData.get('state')?.toString() ?? '';
		const city = formData.get('city')?.toString() || null;
		const isPublicVisible = formData.get('isPublicVisible') === 'on';

		// Validation
		if (!name) return fail(400, { error: 'Name is required' });
		if (!dateTime) return fail(400, { error: 'Date is required' });
		if (!country) return fail(400, { error: 'Country is required' });
		if (!state) return fail(400, { error: 'State is required' });

		try {
			await updateEvent(locals.supabase, params.id, {
				name,
				description,
				dateTime: new Date(dateTime).toISOString(),
				country,
				state,
				city,
				isPublicVisible
			});

			throw redirect(303, `/panel/events/${params.id}`);
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err && 'location' in err) {
				throw err;
			}
			console.error('Error updating event:', err);
			return fail(500, { error: 'Failed to update event' });
		}
	}
};

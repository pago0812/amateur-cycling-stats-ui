import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { createEvent } from '$lib/services/events';

export const load: PageServerLoad = async ({ locals, parent }) => {
	await parent(); // Ensure user is authenticated organizer

	// Fetch categories, genders, and lengths
	const [categoriesResult, gendersResult, lengthsResult] = await Promise.all([
		locals.supabase.from('race_categories').select('id, name').order('name'),
		locals.supabase.from('race_category_genders').select('id, name').order('name'),
		locals.supabase.from('race_category_lengths').select('id, name').order('name')
	]);

	return {
		categories: categoriesResult.data ?? [],
		genders: gendersResult.data ?? [],
		lengths: lengthsResult.data ?? []
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();

		const name = formData.get('name')?.toString() ?? '';
		const description = formData.get('description')?.toString() || null;
		const dateTime = formData.get('dateTime')?.toString() ?? '';
		const country = formData.get('country')?.toString() ?? '';
		const state = formData.get('state')?.toString() ?? '';
		const city = formData.get('city')?.toString() || null;
		const isPublicVisible = formData.get('isPublicVisible') === 'on';
		const categoryIds = formData.getAll('categoryIds').map((v) => v.toString());
		const genderIds = formData.getAll('genderIds').map((v) => v.toString());
		const lengthIds = formData.getAll('lengthIds').map((v) => v.toString());

		// Validation
		if (!name) return fail(400, { error: 'Name is required' });
		if (!dateTime) return fail(400, { error: 'Date is required' });
		if (!country) return fail(400, { error: 'Country is required' });
		if (!state) return fail(400, { error: 'State is required' });
		if (categoryIds.length === 0) return fail(400, { error: 'Select at least one category' });
		if (genderIds.length === 0) return fail(400, { error: 'Select at least one gender' });
		if (lengthIds.length === 0) return fail(400, { error: 'Select at least one length' });

		try {
			const event = await createEvent(locals.supabase, {
				name,
				description,
				dateTime: new Date(dateTime).toISOString(),
				country,
				state,
				city,
				isPublicVisible,
				categoryIds,
				genderIds,
				lengthIds
			});

			throw redirect(303, `/panel/events/${event.id}`);
		} catch (err) {
			// Re-throw redirects
			if (err && typeof err === 'object' && 'status' in err && 'location' in err) {
				throw err;
			}
			console.error('Error creating event:', err);
			return fail(500, { error: 'Failed to create event' });
		}
	}
};

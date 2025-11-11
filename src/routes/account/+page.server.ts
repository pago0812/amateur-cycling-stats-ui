import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCyclistWithResultsById } from '$lib/services/cyclists';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();

	// User is guaranteed to exist and be a cyclist from layout
	if (!user?.cyclist?.id) {
		throw error(404, 'Cyclist profile not found');
	}

	try {
		// Fetch full cyclist data with race results
		const cyclist = await getCyclistWithResultsById(locals.supabase, {
			id: user.cyclist.id
		});

		// Cyclist should always exist if user has cyclist.id, but handle null gracefully
		if (!cyclist) {
			throw error(404, 'Cyclist profile not found');
		}

		return {
			cyclist
		};
	} catch (err) {
		console.error('Error loading cyclist profile:', err);
		throw error(500, 'Failed to load cyclist profile');
	}
};

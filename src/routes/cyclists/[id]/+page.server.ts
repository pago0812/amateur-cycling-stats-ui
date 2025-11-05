import { getCyclistWithResultsById } from '$lib/services/cyclists';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		const cyclist = await getCyclistWithResultsById(locals.supabase, { id: params.id });

		if (!cyclist) {
			throw error(404, 'Cyclist not found');
		}

		return {
			cyclist
		};
	} catch (err) {
		console.error('Error loading cyclist details:', err);
		throw error(500, 'Failed to load cyclist details');
	}
};

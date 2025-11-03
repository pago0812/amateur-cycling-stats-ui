import { getEventWithCategoriesById } from '$lib/services/events';
import { getRaceWithResultsWithFilters } from '$lib/services/races';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	try {
		const event = await getEventWithCategoriesById({ id: params.id });

		if (!event) {
			throw error(404, 'Event not found');
		}

		// Get filter values from URL or use defaults from event
		const category =
			url.searchParams.get('category') || event?.supportedRaceCategories?.[0]?.documentId || '';
		const length =
			url.searchParams.get('length') ||
			event?.supportedRaceCategoryLengths?.[0]?.documentId ||
			'';
		const gender =
			url.searchParams.get('gender') ||
			event?.supportedRaceCategoryGenders?.[0]?.documentId ||
			'';

		// Fetch race results with filters
		const race = await getRaceWithResultsWithFilters({
			age: category,
			length: length,
			gender: gender
		});

		return {
			event,
			race,
			selectedCategory: category,
			selectedLength: length,
			selectedGender: gender
		};
	} catch (err) {
		console.error('Error loading event details:', err);
		throw error(500, 'Failed to load event details');
	}
};

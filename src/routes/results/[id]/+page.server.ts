import { getEventWithCategoriesById } from '$lib/services/events';
import { getRaceWithResultsWithFilters } from '$lib/services/races';
import { error } from '@sveltejs/kit';
import { t } from '$lib/i18n/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, locals }) => {
	const event = await getEventWithCategoriesById(locals.supabase, { id: params.id });

	if (!event) {
		throw error(404, t(locals.locale, 'events.errors.notFound'));
	}

	// Get filter values from URL or use defaults from event (use 'id' instead of 'documentId')
	const categoryId =
		url.searchParams.get('category') || event?.supportedRaceCategories?.[0]?.id || '';
	const lengthId =
		url.searchParams.get('length') || event?.supportedRaceCategoryLengths?.[0]?.id || '';
	const genderId =
		url.searchParams.get('gender') || event?.supportedRaceCategoryGenders?.[0]?.id || '';

	// Get race with selected filters - returns null if no race exists for this combination
	const race = await getRaceWithResultsWithFilters(locals.supabase, {
		eventId: params.id,
		categoryId,
		lengthId,
		genderId
	});

	// Return data even if race is null - UI will handle displaying "no results" message
	return {
		event,
		race, // Can be null - UI handles this gracefully
		selectedCategory: categoryId,
		selectedLength: lengthId,
		selectedGender: genderId
	};
};

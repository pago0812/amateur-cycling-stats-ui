import { getEventWithRacesById } from '$lib/services/events';
import { getRaceWithRaceResultsById } from '$lib/services/races';
import { error, redirect } from '@sveltejs/kit';
import { t } from '$lib/i18n/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, locals }) => {
	const event = await getEventWithRacesById(locals.supabase, { id: params.id });

	if (!event) {
		throw error(404, t(locals.locale, 'events.errors.notFound'));
	}

	// If event has no races, return null race
	if (!event.races || event.races.length === 0) {
		return {
			event,
			race: null,
			filterState: null
		};
	}

	// Get query params
	const raceIdFromUrl = url.searchParams.get('raceId');
	const categoryIdFromUrl = url.searchParams.get('categoryId');
	const genderIdFromUrl = url.searchParams.get('genderId');
	const lengthIdFromUrl = url.searchParams.get('lengthId');

	// Mode A: raceId provided (priority mode)
	if (raceIdFromUrl) {
		// Check if the provided raceId exists in event.races
		const raceExists = event.races.some((r) => r.id === raceIdFromUrl);

		if (!raceExists) {
			// Invalid raceId - redirect to first race
			throw redirect(302, `/results/${params.id}?raceId=${event.races[0].id}`);
		}

		// Valid raceId - fetch race with results
		const race = await getRaceWithRaceResultsById(locals.supabase, { id: raceIdFromUrl });

		return {
			event,
			race,
			filterState: race
				? {
						categoryId: race.raceCategoryId,
						genderId: race.raceCategoryGenderId,
						lengthId: race.raceCategoryLengthId
					}
				: null
		};
	}

	// Mode B: categoryId/genderId/lengthId provided
	if (categoryIdFromUrl && genderIdFromUrl && lengthIdFromUrl) {
		// Validate that the IDs are in the event's supported options
		const categoryValid = event.supportedRaceCategories.some((c) => c.id === categoryIdFromUrl);
		const genderValid = event.supportedRaceCategoryGenders.some((g) => g.id === genderIdFromUrl);
		const lengthValid = event.supportedRaceCategoryLengths.some((l) => l.id === lengthIdFromUrl);

		if (!categoryValid || !genderValid || !lengthValid) {
			// Invalid filter IDs - redirect to first race
			throw redirect(302, `/results/${params.id}?raceId=${event.races[0].id}`);
		}

		// Try to find a matching race
		const matchingRace = event.races.find(
			(r) =>
				r.raceCategoryId === categoryIdFromUrl &&
				r.raceCategoryGenderId === genderIdFromUrl &&
				r.raceCategoryLengthId === lengthIdFromUrl
		);

		if (matchingRace) {
			// Found a match - redirect to raceId mode (Mode A)
			throw redirect(302, `/results/${params.id}?raceId=${matchingRace.id}`);
		}

		// No matching race - return filter state without race
		return {
			event,
			race: null,
			filterState: {
				categoryId: categoryIdFromUrl,
				genderId: genderIdFromUrl,
				lengthId: lengthIdFromUrl
			}
		};
	}

	// No params provided - auto-select first race
	throw redirect(302, `/results/${params.id}?raceId=${event.races[0].id}`);
};

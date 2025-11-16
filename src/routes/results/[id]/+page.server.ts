import { getEventWithRacesById } from '$lib/services/events';
import { getRaceWithRaceResultsById } from '$lib/services/races';
import { error } from '@sveltejs/kit';
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
			race: null
		};
	}

	// Get raceId from URL
	const raceIdFromUrl = url.searchParams.get('raceId');

	// If no raceId in URL, return null race (user hasn't selected filters yet)
	if (!raceIdFromUrl) {
		return {
			event,
			race: null
		};
	}

	// Check if the provided raceId exists in event.races
	const raceExists = event.races.some((r) => r.id === raceIdFromUrl);

	// If raceId doesn't exist in event.races, return null race
	if (!raceExists) {
		return {
			event,
			race: null
		};
	}

	// Valid raceId - fetch race with results using RPC
	const race = await getRaceWithRaceResultsById(locals.supabase, { id: raceIdFromUrl });

	// Return event and race
	return {
		event,
		race
	};
};

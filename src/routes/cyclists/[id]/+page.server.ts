import { getCyclistById } from '$lib/services/cyclists';
import { getRaceResultsByUserId } from '$lib/services/race-results';
import { error } from '@sveltejs/kit';
import { t } from '$lib/i18n/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	// Parallel fetch: cyclist profile + race results
	const [cyclist, raceResults] = await Promise.all([
		getCyclistById(locals.supabase, { id: params.id }),
		getRaceResultsByUserId(locals.supabase, { userId: params.id })
	]);

	if (!cyclist) {
		throw error(404, t(locals.locale, 'cyclists.errors.notFound'));
	}

	return {
		cyclist,
		raceResults
	};
};

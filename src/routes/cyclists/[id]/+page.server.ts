import { getCyclistWithResultsById } from '$lib/services/cyclists';
import { error } from '@sveltejs/kit';
import { t } from '$lib/i18n/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const cyclist = await getCyclistWithResultsById(locals.supabase, { id: params.id });

	if (!cyclist) {
		throw error(404, t(locals.locale, 'cyclists.errors.notFound'));
	}

	return {
		cyclist
	};
};

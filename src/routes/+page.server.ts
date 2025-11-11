import { redirect } from '@sveltejs/kit';
import { getFutureEvents } from '$lib/services/events';
import type { PageServerLoad, Actions } from './$types';
import type { Event } from '$lib/types/domain';
import { Urls } from '$lib/constants/urls';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		const events = await getFutureEvents(locals.supabase);
		return {
			events,
			error: ''
		};
	} catch (error) {
		console.error('Error loading future events:', error);
		return {
			events: [] as Event[],
			error: 'Failed to load events'
		};
	}
};

export const actions = {
	logout: async ({ locals }) => {
		await locals.supabase.auth.signOut();
		throw redirect(302, Urls.HOME);
	}
} satisfies Actions;

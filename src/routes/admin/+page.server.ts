import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { Urls } from '$lib/constants/urls';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions = {
	logout: async ({ locals }) => {
		await locals.supabase.auth.signOut();
		throw redirect(302, Urls.HOME);
	}
} satisfies Actions;

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { Urls } from '$lib/constants/urls';
import { getOrganizationById } from '$lib/services/organizations';

export const load: PageServerLoad = async ({ locals, parent }) => {
	// Get user from parent layout
	const { user } = await parent();

	// Get organization ID from user's organizer relationship
	const organizationId = user.organizer?.organizationId;

	if (!organizationId) {
		// Organizer doesn't have an organization linked - shouldn't happen
		console.error('Organizer user has no organization ID');
		return { organization: null };
	}

	try {
		// Fetch organization details
		const organization = await getOrganizationById(locals.supabase, { id: organizationId });
		return { organization };
	} catch (error) {
		console.error('Error loading organization:', error);
		return { organization: null };
	}
};

export const actions = {
	logout: async ({ locals }) => {
		await locals.supabase.auth.signOut();
		throw redirect(302, Urls.HOME);
	}
} satisfies Actions;

import type { PageServerLoad } from './$types';
import { getOrganizersByOrganizationId } from '$lib/services/organizers';

export const load: PageServerLoad = async ({ parent, locals }) => {
	// Get user from parent layout
	const { user } = await parent();

	// Get organization ID from user's organizer relationship
	const organizationId = user.organizer?.organizationId;

	if (!organizationId) {
		// Organizer doesn't have an organization linked - shouldn't happen
		console.error('Organizer user has no organization ID');
		return { organizers: [] };
	}

	try {
		// Fetch organizers for this organization
		// Note: We need to use the UUID (not short_id) for the foreign key query
		// Convert organization.id (short_id) to UUID first
		const { data: orgData } = await locals.supabase
			.from('organizations')
			.select('id')
			.eq('short_id', organizationId)
			.single();

		if (!orgData) {
			return { organizers: [] };
		}

		const organizers = await getOrganizersByOrganizationId(locals.supabase, {
			organizationId: orgData.id
		});

		return { organizers };
	} catch (error) {
		console.error('Error loading organizers:', error);
		return { organizers: [], error: 'Failed to load members' };
	}
};

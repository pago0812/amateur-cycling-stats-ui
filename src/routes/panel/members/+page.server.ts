import type { PageServerLoad } from './$types';
import { getOrganizersByOrganizationId } from '$lib/services/organizers';

export const load: PageServerLoad = async ({ parent, locals }) => {
	// Get organization from parent layout
	const { organization } = await parent();

	if (!organization) {
		console.error('No organization found for organizer');
		return { organizers: [] };
	}

	try {
		// Fetch organizers for this organization (organization.id is UUID)
		const organizers = await getOrganizersByOrganizationId(locals.supabase, {
			organizationId: organization.id
		});

		return { organizers };
	} catch (error) {
		console.error('Error loading organizers:', error);
		return { organizers: [], error: 'Failed to load members' };
	}
};

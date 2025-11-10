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
		// Fetch organizers for this organization
		// Note: We need to use the UUID (not short_id) for the foreign key query
		// Convert organization.id (short_id) to UUID first
		const { data: orgData } = await locals.supabase
			.from('organizations')
			.select('id')
			.eq('short_id', organization.id)
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

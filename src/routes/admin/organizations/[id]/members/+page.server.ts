import type { PageServerLoad } from './$types';
import { getOrganizersByOrganizationId } from '$lib/services/organizers';

export const load: PageServerLoad = async ({ parent, locals }) => {
	// Get organization from parent layout
	const { organization } = await parent();

	try {
		// Fetch organizers for this organization
		// Note: We need to use the UUID (not short_id) for the foreign key query
		// We'll need to convert the organization.id to UUID first

		// For now, we'll use a direct query with short_id lookup
		// Get organization UUID from short_id
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

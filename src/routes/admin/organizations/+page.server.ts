import type { PageServerLoad } from './$types';
import { getAllOrganizations } from '$lib/services/organizations';

export const load: PageServerLoad = async ({ locals }) => {
	// Note: Authentication and ADMIN role check handled by /admin/+layout.server.ts
	try {
		// Load all active organizations with event count
		const organizations = await getAllOrganizations(locals.supabase);

		return {
			organizations
		};
	} catch (error) {
		console.error('Error loading organizations:', error);
		return {
			organizations: [],
			error: error instanceof Error ? error.message : 'Failed to load organizations'
		};
	}
};

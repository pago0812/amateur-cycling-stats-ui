import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getOrganizationById } from '$lib/services/organizations';
import { getOrganizersCountByOrganizationId } from '$lib/services/organizers';
import { t } from '$lib/i18n/server';

export const load: LayoutServerLoad = async ({ params, locals }) => {
	// Note: Authentication and ADMIN role check handled by /admin/+layout.server.ts

	try {
		// Fetch organization by short_id
		const organization = await getOrganizationById(locals.supabase, { id: params.id });

		if (!organization) {
			throw error(404, t(locals.locale, 'admin.organizations.errors.notFound'));
		}

		// Get organization UUID from short_id to fetch organizers count
		const { data: orgData } = await locals.supabase
			.from('organizations')
			.select('id')
			.eq('short_id', params.id)
			.single();

		// Fetch organizers count for this organization
		const organizersCount = orgData
			? await getOrganizersCountByOrganizationId(locals.supabase, orgData.id)
			: 0;

		return { organization, organizersCount };
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		console.error('Error loading organization:', err);
		throw error(500, t(locals.locale, 'admin.organizations.errors.loadFailed'));
	}
};

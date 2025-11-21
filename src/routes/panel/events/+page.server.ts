import type { PageServerLoad } from './$types';
import { getEventsByOrganization } from '$lib/services/events';

export const load: PageServerLoad = async ({ locals, parent, url }) => {
	const { user } = await parent();

	// Get filter from query params
	const filter = (url.searchParams.get('filter') ?? 'all') as 'all' | 'future' | 'past';

	// Fetch events for the user's organization
	const events = await getEventsByOrganization(locals.supabase, {
		organizationId: user.organizationId!,
		filter
	});

	return {
		events,
		filter
	};
};

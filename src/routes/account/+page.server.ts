import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getRaceResultsByUserId } from '$lib/services/race-results';
import { RoleTypeEnum, type Cyclist } from '$lib/types/domain';

export const load: PageServerLoad = async ({ parent, locals }) => {
	// Get user from parent layout (already validated as cyclist)
	const { user } = await parent();

	// User is guaranteed to exist and be a cyclist from layout
	if (!user || user.roleType !== RoleTypeEnum.CYCLIST) {
		throw error(404, 'Cyclist profile not found');
	}

	// Type guard: user is a Cyclist (has cyclist-specific properties)
	const cyclist = user as Cyclist;

	try {
		// Fetch only race results (cyclist data already available from parent)
		const raceResults = await getRaceResultsByUserId(locals.supabase, {
			userId: user.id
		});

		return {
			cyclist,
			raceResults
		};
	} catch (err) {
		console.error('Error loading race results:', err);
		throw error(500, 'Failed to load race results');
	}
};

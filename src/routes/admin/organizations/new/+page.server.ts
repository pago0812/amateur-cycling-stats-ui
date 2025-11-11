import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { createOrganization } from '$lib/services/organizations';
import { t } from '$lib/i18n/server';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const description = formData.get('description')?.toString();

		// Validation
		if (!name || name.trim().length === 0) {
			return fail(400, {
				error: t(locals.locale, 'admin.organizations.errors.nameRequired'),
				name,
				description
			});
		}

		if (name.trim().length < 3) {
			return fail(400, {
				error: t(locals.locale, 'admin.organizations.errors.nameMinLength'),
				name,
				description
			});
		}

		// Create organization
		try {
			const organization = await createOrganization(locals.supabase, {
				name: name.trim(),
				description: description?.trim() || null
			});

			return {
				success: true,
				organizationId: organization.id
			};
		} catch (error) {
			console.error('Error creating organization:', error);
			return fail(500, {
				error: t(locals.locale, 'admin.organizations.errors.createFailed'),
				name,
				description
			});
		}
	}
};

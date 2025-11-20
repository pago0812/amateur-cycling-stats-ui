import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getInvitationByEmail } from '$lib/services/organization-invitations';
import { getOrganizationById, completeOrganizerOwnerSetup } from '$lib/services';
import { t } from '$lib/i18n/server';

export const load: PageServerLoad = async ({ parent, locals }) => {
	console.log('=== [Complete Setup Load] START ===');

	// Get user from parent layout
	const { user } = await parent();

	console.log('[Complete Setup Load] getSessionUser result:', {
		hasUser: !!user,
		userId: user?.id,
		email: user?.email,
		roleType: user?.roleType
	});

	if (!user || !user.email) {
		console.error('[Complete Setup Load] ❌ No user session or email, redirecting to login');
		throw redirect(303, '/login');
	}

	console.log('[Complete Setup Load] 🔄 Fetching invitation by email:', user.email);

	// Fetch pending invitation by email
	const invitation = await getInvitationByEmail(locals.supabase, user.email);

	console.log('[Complete Setup Load] Invitation lookup result:', {
		hasInvitation: !!invitation,
		invitationId: invitation?.id,
		organizationId: invitation?.organizationId,
		email: invitation?.email,
		status: invitation?.status,
		invitedOwnerName: invitation?.invitedOwnerName
	});

	if (!invitation) {
		console.error('[Complete Setup Load] ❌ No pending invitation found for email:', user.email);
		throw redirect(303, '/auth/setup-failed?error=no_invitation');
	}

	console.log(
		'[Complete Setup Load] 🔄 Fetching organization data for ID:',
		invitation.organizationId
	);

	// Get organization using service
	const organization = await getOrganizationById(locals.supabase, {
		id: invitation.organizationId
	});

	console.log('[Complete Setup Load] Organization lookup result:', {
		hasOrganization: !!organization,
		name: organization?.name
	});

	if (!organization) {
		console.error(
			'[Complete Setup Load] ❌ Organization not found for ID:',
			invitation.organizationId
		);
		throw redirect(303, '/auth/setup-failed?error=organization_not_found');
	}

	console.log('[Complete Setup Load] ✅ Load successful, returning data');

	return {
		invitation,
		organizationName: organization.name,
		email: user.email
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = await locals.getSessionUser();

		if (!user || !user.email) {
			throw redirect(303, '/login');
		}

		const formData = await request.formData();
		const firstName = formData.get('firstName')?.toString();
		const lastName = formData.get('lastName')?.toString();
		const password = formData.get('password')?.toString();
		const confirmPassword = formData.get('confirmPassword')?.toString();

		// Validation
		if (!firstName || firstName.trim().length === 0) {
			return fail(400, {
				error: t(locals.locale, 'auth.completeSetup.errors.firstNameRequired'),
				firstName,
				lastName
			});
		}

		if (!lastName || lastName.trim().length === 0) {
			return fail(400, {
				error: t(locals.locale, 'auth.completeSetup.errors.lastNameRequired'),
				firstName,
				lastName
			});
		}

		if (!password || password.length < 6) {
			return fail(400, {
				error: t(locals.locale, 'auth.completeSetup.errors.passwordMinLength'),
				firstName,
				lastName
			});
		}

		if (password !== confirmPassword) {
			return fail(400, {
				error: t(locals.locale, 'auth.completeSetup.errors.passwordsNotMatch'),
				firstName,
				lastName
			});
		}

		// Fetch invitation
		const invitation = await getInvitationByEmail(locals.supabase, user.email);

		if (!invitation) {
			throw redirect(303, '/auth/setup-failed?error=no_invitation');
		}

		try {
			// 1. Update user password (must be done via Auth API, not database)
			const { error: passwordError } = await locals.supabase.auth.updateUser({
				password: password,
				data: {
					first_name: firstName.trim(),
					last_name: lastName.trim()
				}
			});

			if (passwordError) {
				console.error('[Complete Setup] Failed to update password:', passwordError);
				return fail(500, {
					error: t(locals.locale, 'auth.completeSetup.errors.setupFailed'),
					firstName,
					lastName
				});
			}

			// 2. Get auth user ID
			const {
				data: { user: authUser }
			} = await locals.supabase.auth.getUser();

			if (!authUser) {
				console.error('[Complete Setup] Failed to get auth user');
				return fail(500, {
					error: t(locals.locale, 'auth.completeSetup.errors.setupFailed'),
					firstName,
					lastName
				});
			}

			// 3. Complete setup atomically (all database operations in one transaction)
			const setupResult = await completeOrganizerOwnerSetup(locals.supabase, {
				authUserId: authUser.id,
				firstName: firstName.trim(),
				lastName: lastName.trim(),
				email: user.email
			});

			if (!setupResult.success) {
				console.error('[Complete Setup] Setup failed');
				return fail(500, {
					error: t(locals.locale, 'auth.completeSetup.errors.setupFailed'),
					firstName,
					lastName
				});
			}

			console.log('[Complete Setup] ✅ Setup completed successfully:', setupResult);

			// Success! Redirect to organization page
			throw redirect(303, `/admin/organizations/${setupResult.organizationId}`);
		} catch (err) {
			// Re-throw redirects (SvelteKit redirect() throws a Redirect object, not Response)
			if (err && typeof err === 'object' && 'status' in err && 'location' in err) {
				throw err;
			}

			console.error('[Complete Setup] Error during setup:', err);
			return fail(500, {
				error: t(locals.locale, 'auth.completeSetup.errors.setupFailed'),
				firstName,
				lastName
			});
		}
	}
};

import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getInvitationByEmail } from '$lib/services/organization-invitations';
import { t } from '$lib/i18n/server';

export const load: PageServerLoad = async ({ locals }) => {
	console.log('=== [Complete Setup Load] START ===');

	const { user } = await locals.safeGetSession();

	console.log('[Complete Setup Load] safeGetSession result:', {
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

	// Get organization UUID from invitation
	const { data: orgData, error: orgError } = await locals.supabase
		.from('organizations')
		.select('short_id, name')
		.eq('id', invitation.organizationId)
		.single();

	console.log('[Complete Setup Load] Organization lookup result:', {
		error: orgError?.message,
		hasOrgData: !!orgData,
		shortId: orgData?.short_id,
		name: orgData?.name
	});

	if (!orgData) {
		console.error(
			'[Complete Setup Load] ❌ Organization not found for ID:',
			invitation.organizationId
		);
		throw redirect(303, '/auth/setup-failed?error=organization_not_found');
	}

	console.log('[Complete Setup Load] ✅ Load successful, returning data');

	return {
		invitation,
		organizationName: orgData.name,
		email: user.email
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();

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
			const { data: setupResult, error: setupError } = await locals.supabase.rpc(
				'complete_organizer_owner_setup',
				{
					p_auth_user_id: authUser.id,
					p_first_name: firstName.trim(),
					p_last_name: lastName.trim(),
					p_invitation_email: user.email
				}
			);

			if (setupError || !setupResult) {
				console.error('[Complete Setup] Setup failed:', setupError);
				return fail(500, {
					error: t(locals.locale, 'auth.completeSetup.errors.setupFailed'),
					firstName,
					lastName
				});
			}

			console.log('[Complete Setup] ✅ Setup completed successfully:', setupResult);

			// Type cast the JSONB result (Supabase doesn't auto-infer JSONB structure)
			const result = setupResult as {
				success: boolean;
				organization_short_id: string;
				user_id: string;
				organization_id: string;
			};

			// Success! Redirect to organization page
			throw redirect(303, `/admin/organizations/${result.organization_short_id}`);
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

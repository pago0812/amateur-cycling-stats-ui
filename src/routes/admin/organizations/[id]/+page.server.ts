import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { SITE_URL } from '$env/static/private';
import {
	deleteOrganization,
	deactivateOrganization,
	activateOrganization,
	permanentlyDeleteOrganization
} from '$lib/services/organizations';
import {
	getInvitationByOrganizationId,
	incrementRetryCount,
	deleteInvitationByOrganizationId
} from '$lib/services/organization-invitations';
import { generateInvitationLink, deleteAuthUserById } from '$lib/services/auth';
import { sendInvitationEmail } from '$lib/services/mailersend';
import { t } from '$lib/i18n/server';

export const actions: Actions = {
	delete: async ({ params, locals }) => {
		// Layout already ensures user is authenticated and has ADMIN role
		try {
			// Soft delete organization (sets state = DISABLED)
			await deleteOrganization(locals.supabase, { id: params.id });
		} catch (err) {
			// Log error and return user-friendly message
			console.error('Error deleting organization:', err);
			return fail(500, {
				error: t(locals.locale, 'admin.organizations.errors.deleteFailed')
			});
		}

		// Redirect to organizations list (outside try-catch so it's not caught as error)
		throw redirect(303, '/admin/organizations');
	},

	resendInvite: async ({ params, locals }) => {
		// Get organization state and name
		const { data: orgData, error: orgError } = await locals.supabase
			.from('organizations')
			.select('id, state, name')
			.eq('id', params.id)
			.single();

		if (orgError || !orgData) {
			return fail(404, {
				error: t(locals.locale, 'admin.organizations.errors.notFound')
			});
		}

		// Verify organization is in WAITING_OWNER state
		if (orgData.state !== 'WAITING_OWNER') {
			return fail(400, {
				error: 'Organization is not waiting for owner invitation'
			});
		}

		try {
			// Get pending invitation
			const invitation = await getInvitationByOrganizationId(locals.supabase, orgData.id);

			if (!invitation) {
				return fail(404, {
					error: 'No pending invitation found for this organization'
				});
			}

			// Generate new invitation link for existing auth user
			const callbackUrl = `${SITE_URL}/auth/callback`;
			const linkResult = await generateInvitationLink({
				email: invitation.email,
				redirectTo: callbackUrl
			});

			if (!linkResult.success || !linkResult.actionLink) {
				console.error('Failed to generate invitation link:', linkResult.error);
				return fail(500, {
					error: t(locals.locale, 'admin.organizations.errors.resendFailed')
				});
			}

			// Send invitation email via MailerSend
			const emailResult = await sendInvitationEmail({
				to: invitation.email,
				organizationName: orgData.name,
				ownerName: invitation.invitedOwnerName,
				confirmationUrl: linkResult.actionLink
			});

			if (!emailResult.success) {
				console.error('Failed to send invitation email:', emailResult.error);
				return fail(500, {
					error: t(locals.locale, 'admin.organizations.errors.resendFailed')
				});
			}

			// Update last_invitation_sent_at timestamp
			await incrementRetryCount(locals.supabase, { id: invitation.id });

			return {
				success: true,
				message: t(locals.locale, 'admin.organizations.success.invitationResent')
			};
		} catch (err) {
			console.error('Error resending invitation:', err);
			return fail(500, {
				error: t(locals.locale, 'admin.organizations.errors.resendFailed')
			});
		}
	},

	deactivate: async ({ params, locals }) => {
		// Layout already ensures user is authenticated and has ADMIN role
		try {
			// Get organization state
			const { data: orgData, error: orgError } = await locals.supabase
				.from('organizations')
				.select('id, state')
				.eq('id', params.id)
				.single();

			if (orgError || !orgData) {
				return fail(404, {
					error: t(locals.locale, 'admin.organizations.errors.notFound')
				});
			}

			// Get pending invitation if exists
			const invitation = await getInvitationByOrganizationId(locals.supabase, orgData.id);

			// If there's a pending invitation, clean it up
			if (invitation) {
				// Get auth user ID by invitation email
				const { data: usersData } = await locals.supabase
					.from('users')
					.select('auth_user_id')
					.eq('email', invitation.email)
					.maybeSingle();

				// If we found the auth user, try to delete them
				if (usersData?.auth_user_id) {
					await deleteAuthUserById(usersData.auth_user_id);
				}

				// Delete invitation record
				await deleteInvitationByOrganizationId(locals.supabase, orgData.id);
			}

			// Deactivate organization (set state = DISABLED)
			await deactivateOrganization(locals.supabase, { id: params.id });
		} catch (err) {
			console.error('Error deactivating organization:', err);
			return fail(500, {
				error: t(locals.locale, 'admin.organizations.errors.deactivateFailed')
			});
		}

		// Redirect to organizations list
		throw redirect(303, '/admin/organizations');
	},

	activate: async ({ params, locals }) => {
		// Layout already ensures user is authenticated and has ADMIN role
		try {
			// Activate organization (set state = ACTIVE)
			await activateOrganization(locals.supabase, { id: params.id });
		} catch (err) {
			console.error('Error activating organization:', err);
			return fail(500, {
				error: t(locals.locale, 'admin.organizations.errors.activateFailed')
			});
		}

		// Redirect to organizations list
		throw redirect(303, '/admin/organizations');
	},

	permanentDelete: async ({ params, locals }) => {
		// Layout already ensures user is authenticated and has ADMIN role
		try {
			// Permanently delete organization from database
			await permanentlyDeleteOrganization(locals.supabase, { id: params.id });
		} catch (err) {
			console.error('Error permanently deleting organization:', err);
			return fail(500, {
				error: t(locals.locale, 'admin.organizations.errors.deletePermanentlyFailed')
			});
		}

		// Redirect to organizations list
		throw redirect(303, '/admin/organizations');
	}
};

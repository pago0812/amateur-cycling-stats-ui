import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { SITE_URL } from '$env/static/private';
import {
	getOrganizationById,
	updateOrganization,
	permanentlyDeleteOrganization
} from '$lib/services/organizations';
import {
	getInvitationByOrganizationId,
	incrementRetryCount,
	deleteInvitationByOrganizationId
} from '$lib/services/organization-invitations';
import { generateInvitationLink, deleteOnBehalfUserById } from '$lib/services/auth';
import { sendInvitationEmail } from '$lib/services/mailersend';
import { getUserByEmail } from '$lib/services/users';
import { t } from '$lib/i18n/server';

export const actions: Actions = {
	resendInvite: async ({ params, locals }) => {
		// Get organization using service
		const organization = await getOrganizationById(locals.supabase, { id: params.id });

		if (!organization) {
			return fail(404, {
				error: t(locals.locale, 'admin.organizations.errors.notFound')
			});
		}

		// Verify organization is in WAITING_OWNER state
		if (organization.state !== 'WAITING_OWNER') {
			return fail(400, {
				error: 'Organization is not waiting for owner invitation'
			});
		}

		try {
			// Get pending invitation
			const invitation = await getInvitationByOrganizationId(locals.supabase, organization.id);

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
				organizationName: organization.name,
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
			// Get organization using service
			const organization = await getOrganizationById(locals.supabase, { id: params.id });

			if (!organization) {
				return fail(404, {
					error: t(locals.locale, 'admin.organizations.errors.notFound')
				});
			}

			// Get pending invitation if exists
			const invitation = await getInvitationByOrganizationId(locals.supabase, organization.id);

			// If there's a pending invitation, clean it up
			if (invitation) {
				// Get user by invitation email using service
				const user = await getUserByEmail(locals.supabase, invitation.email);

				// If we found the user, delete them via admin API
				if (user) {
					const result = await deleteOnBehalfUserById(user.id);
					if (!result.success) {
						console.error('Failed to delete user:', result.error);
					}
				}

				// Delete invitation record
				await deleteInvitationByOrganizationId(locals.supabase, organization.id);
			}

			// Deactivate organization (set state = DISABLED)
			await updateOrganization(locals.supabase, params.id, { state: 'DISABLED' });
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
			await updateOrganization(locals.supabase, params.id, { state: 'ACTIVE' });
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

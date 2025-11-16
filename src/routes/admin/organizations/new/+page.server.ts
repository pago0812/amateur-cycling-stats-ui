import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { SITE_URL } from '$env/static/private';
import { createOrganization } from '$lib/services/organizations';
import { createInvitation } from '$lib/services/organization-invitations';
import { checkUserExists, generateInvitationLink } from '$lib/services/auth-admin';
import {
	createAuthUserForInvitation,
	createOrganizerOwnerUser
} from '$lib/services/users-management';
import { sendInvitationEmail } from '$lib/services/mailersend';
import { t } from '$lib/i18n/server';

// Simple email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const description = formData.get('description')?.toString();
		const ownerEmail = formData.get('ownerEmail')?.toString();
		const ownerName = formData.get('ownerName')?.toString();

		// Validation - Organization fields
		if (!name || name.trim().length === 0) {
			return fail(400, {
				error: t(locals.locale, 'admin.organizations.errors.nameRequired'),
				name,
				description,
				ownerEmail,
				ownerName
			});
		}

		if (name.trim().length < 3) {
			return fail(400, {
				error: t(locals.locale, 'admin.organizations.errors.nameMinLength'),
				name,
				description,
				ownerEmail,
				ownerName
			});
		}

		// Validation - Owner fields
		if (!ownerEmail || ownerEmail.trim().length === 0) {
			return fail(400, {
				error: t(locals.locale, 'admin.organizations.errors.ownerEmailRequired'),
				name,
				description,
				ownerEmail,
				ownerName
			});
		}

		if (!EMAIL_REGEX.test(ownerEmail.trim())) {
			return fail(400, {
				error: t(locals.locale, 'admin.organizations.errors.ownerEmailInvalid'),
				name,
				description,
				ownerEmail,
				ownerName
			});
		}

		if (!ownerName || ownerName.trim().length === 0) {
			return fail(400, {
				error: t(locals.locale, 'admin.organizations.errors.ownerNameRequired'),
				name,
				description,
				ownerEmail,
				ownerName
			});
		}

		// Check if user already exists
		const userExists = await checkUserExists(ownerEmail.trim());
		if (userExists) {
			return fail(400, {
				error: t(locals.locale, 'admin.organizations.errors.emailExists'),
				name,
				description,
				ownerEmail,
				ownerName
			});
		}

		// Create organization with WAITING_OWNER state
		try {
			const organization = await createOrganization(locals.supabase, {
				name: name.trim(),
				description: description?.trim() || null,
				state: 'WAITING_OWNER'
			});

			// Use organization UUID directly
			const organizationId = organization.id;

			// Step 1: Create auth user with skip_auto_create flag
			const authUserResult = await createAuthUserForInvitation({
				email: ownerEmail.trim(),
				metadata: {
					invitedOwnerName: ownerName.trim(),
					organizationId
				}
			});

			if (!authUserResult.success || !authUserResult.authUserId) {
				console.error('Failed to create auth user:', authUserResult.error);
				return fail(500, {
					error: t(locals.locale, 'admin.organizations.errors.invitationFailed'),
					name,
					description,
					ownerEmail,
					ownerName
				});
			}

			// Step 2: Create public user with organizer_owner role and link to organization
			const userResult = await createOrganizerOwnerUser(locals.supabase, {
				authUserId: authUserResult.authUserId,
				firstName: ownerName.trim(),
				lastName: '', // We only have full name from the form
				organizationId
			});

			if (!userResult.success) {
				console.error('Failed to create organizer owner user:', userResult.error);
				return fail(500, {
					error: t(locals.locale, 'admin.organizations.errors.invitationFailed'),
					name,
					description,
					ownerEmail,
					ownerName
				});
			}

			// Step 3: Create invitation record
			await createInvitation(locals.supabase, {
				organizationId,
				email: ownerEmail.trim(),
				invitedOwnerName: ownerName.trim()
			});

			// Step 4: Generate invitation link
			const callbackUrl = `${SITE_URL}/auth/callback`;
			const linkResult = await generateInvitationLink({
				email: ownerEmail.trim(),
				redirectTo: callbackUrl
			});

			if (!linkResult.success || !linkResult.actionLink) {
				console.error('Failed to generate invitation link:', linkResult.error);
				return fail(500, {
					error: t(locals.locale, 'admin.organizations.errors.invitationFailed'),
					name,
					description,
					ownerEmail,
					ownerName
				});
			}

			// Step 5: Send invitation email via MailerSend
			const emailResult = await sendInvitationEmail({
				to: ownerEmail.trim(),
				organizationName: organization.name,
				ownerName: ownerName.trim(),
				confirmationUrl: linkResult.actionLink
			});

			if (!emailResult.success) {
				console.error('Failed to send invitation email:', emailResult.error);
				return fail(500, {
					error: t(locals.locale, 'admin.organizations.errors.invitationFailed'),
					name,
					description,
					ownerEmail,
					ownerName
				});
			}

			return {
				success: true,
				organizationId: organization.id
			};
		} catch (error) {
			console.error('Error creating organization:', error);
			return fail(500, {
				error: t(locals.locale, 'admin.organizations.errors.createFailed'),
				name,
				description,
				ownerEmail,
				ownerName
			});
		}
	}
};

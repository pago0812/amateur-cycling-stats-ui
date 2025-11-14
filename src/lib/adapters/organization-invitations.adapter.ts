/**
 * Organization Invitations Adapter
 *
 * Transforms database types (snake_case) to domain types (camelCase) for organization invitations.
 */

import type { OrganizationInvitationDB } from '$lib/types/db/organization-invitations.db';
import type {
	OrganizationInvitation,
	OrganizationInvitationStatus
} from '$lib/types/domain/organization-invitation.domain';
import { mapTimestamps } from './common.adapter';

/**
 * Transform OrganizationInvitationDB (database type) to OrganizationInvitation (domain type).
 * Maps snake_case fields to camelCase.
 */
export function adaptOrganizationInvitationFromDb(
	dbInvitation: OrganizationInvitationDB
): OrganizationInvitation {
	return {
		// Identity
		id: dbInvitation.short_id, // Translate: short_id → id

		// Invitation Details
		organizationId: dbInvitation.organization_id,
		email: dbInvitation.email,
		invitedOwnerName: dbInvitation.invited_owner_name,

		// Retry Mechanism
		retryCount: dbInvitation.retry_count,
		lastInvitationSentAt: dbInvitation.last_invitation_sent_at,

		// Status
		status: dbInvitation.status as OrganizationInvitationStatus,

		// Timestamps
		...mapTimestamps(dbInvitation)
	};
}

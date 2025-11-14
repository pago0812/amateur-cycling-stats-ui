/**
 * Organization invitation status enum values
 */
export type OrganizationInvitationStatus = 'pending' | 'accepted' | 'expired';

/**
 * OrganizationInvitation domain type - tracks pending owner invitations for organizations.
 * All fields use camelCase convention.
 */
export interface OrganizationInvitation {
	// Identity
	id: string;

	// Invitation Details
	organizationId: string;
	email: string;
	invitedOwnerName: string;

	// Retry Mechanism
	retryCount: number;
	lastInvitationSentAt: string | null;

	// Status
	status: OrganizationInvitationStatus;

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

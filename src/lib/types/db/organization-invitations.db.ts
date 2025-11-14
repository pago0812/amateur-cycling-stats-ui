/**
 * Database type for organization_invitations table.
 *
 * Note: Manually defined until database.types.ts is regenerated from updated schema.
 */
export interface OrganizationInvitationDB {
	id: string;
	short_id: string;
	organization_id: string;
	email: string;
	invited_owner_name: string;
	retry_count: number;
	last_invitation_sent_at: string | null;
	status: 'pending' | 'accepted' | 'expired';
	created_at: string;
	updated_at: string;
}

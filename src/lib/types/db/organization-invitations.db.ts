import type { Tables } from '../database.types';

/**
 * Database type for organization_invitations table.
 * Use this instead of Tables<'organization_invitations'> throughout the codebase.
 */
export type OrganizationInvitationDB = Tables<'organization_invitations'>;

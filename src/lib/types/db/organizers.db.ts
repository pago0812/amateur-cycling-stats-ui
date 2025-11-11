import type { Tables } from '../database.types';

/**
 * Database type for organizers table.
 * Use this instead of Tables<'organizers'> throughout the codebase.
 */
export type OrganizerDB = Tables<'organizers'>;

/**
 * Response type for organizer with user and role relations.
 * Used by getOrganizersByOrganizationId service.
 */
export interface OrganizerWithUserResponse extends OrganizerDB {
	users: {
		id: string; // UUID
		short_id: string; // NanoID
		first_name: string;
		last_name: string | null;
		role_id: string;
		created_at: string;
		updated_at: string;
		roles: {
			id: string; // UUID
			short_id: string; // NanoID
			name: string;
			created_at: string;
			updated_at: string;
		};
	};
}

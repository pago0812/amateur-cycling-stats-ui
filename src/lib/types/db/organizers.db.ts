import type { Tables, Database } from '../database.types';

/**
 * Database type for organizers table.
 * Use this instead of Tables<'organizers'> throughout the codebase.
 */
export type OrganizerDB = Tables<'organizers'>;

/**
 * RPC response item from get_organizers_by_organization_id.
 * Matches Organizer domain structure but in snake_case.
 * Returns user-centric data (id = user.id, not organizers.id).
 */
export interface OrganizerRpcItem {
	// Identity (user's ID, not organizers.id)
	id: string;
	// Basic Info
	first_name: string;
	last_name: string;
	// Auth Info
	email: string;
	display_name: string | null;
	has_auth: boolean;
	// Role (enum value)
	role_type: Database['public']['Enums']['role_name_enum'];
	// Organization
	organization_id: string;
	// Timestamps (from users table)
	created_at: string;
	updated_at: string;
}

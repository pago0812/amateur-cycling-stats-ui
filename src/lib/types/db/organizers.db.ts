import type { Tables, Database } from '../database.types';

/**
 * Database type for organizers junction table.
 * Use this instead of Tables<'organizers'> for direct table operations.
 */
export type OrganizerTableDB = Tables<'organizers'>;

/**
 * Auto-generated type for organizer RPC response.
 * Returned by get_organizers_by_organization_id() RPC function.
 * Returns user-centric data (id = user.id, not organizers.id) with flattened role and org data.
 */
export type OrganizerDB =
	Database['public']['Functions']['get_organizers_by_organization_id']['Returns'][number];

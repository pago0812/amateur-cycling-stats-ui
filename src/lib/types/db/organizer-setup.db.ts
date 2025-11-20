import type { Database } from '../database.types';

/**
 * Auto-generated type for organizer owner setup completion RPC response.
 * Returned by complete_organizer_owner_setup() RPC function.
 * Returns single success response with organization and user IDs (extract first element from array).
 */
export type OrganizerSetupResponseDB =
	Database['public']['Functions']['complete_organizer_owner_setup']['Returns'][number];

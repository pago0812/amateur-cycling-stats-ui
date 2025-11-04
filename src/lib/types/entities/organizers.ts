import type { Tables } from '$lib/types/database.types';
import type { User } from '$lib/types/entities/users';
import type { Organization } from '$lib/types/entities/organizations';

// Base organizer type from Supabase
export type Organizer = Tables<'organizers'>;

// Extended organizer type with populated relationships
export interface OrganizerWithRelations extends Organizer {
	user?: User;
	organization?: Organization;
}

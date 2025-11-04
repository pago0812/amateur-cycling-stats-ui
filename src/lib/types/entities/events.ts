import type { Tables } from '$lib/types/database.types';
import type { RaceCategory } from '$lib/types/collections/race-category';
import type { RaceCategoryGender } from '$lib/types/collections/race-category-gender';
import type { RaceCategoryLength } from '$lib/types/collections/race-category-length';
import type { Race } from '$lib/types/entities/races';
import type { User } from '$lib/types/entities/users';
import type { Organization } from '$lib/types/entities/organizations';

// Base event type from Supabase
export type Event = Tables<'events'>;

// Extended event type with populated relationships
export interface EventWithRelations extends Event {
	createdBy?: User; // User who created the event (for audit trail)
	organization?: Organization; // Organization that owns/manages the event
	races?: Race[];
	supportedRaceCategories?: RaceCategory[];
	supportedRaceCategoryGenders?: RaceCategoryGender[];
	supportedRaceCategoryLengths?: RaceCategoryLength[];
}

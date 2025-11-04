import type { Tables } from '$lib/types/database.types';
import type { CyclistGender } from '$lib/types/collections/cyclist-gender';
import type { RaceResult } from '$lib/types/entities/race-results';
import type { User } from '$lib/types/entities/users';

// Base cyclist type from Supabase
export type Cyclist = Tables<'cyclists'>;

// Extended cyclist type with populated relationships
export interface CyclistWithRelations extends Cyclist {
	gender?: CyclistGender;
	user?: User;
	raceResults?: RaceResult[];
}

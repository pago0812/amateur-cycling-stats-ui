import type { Tables } from '$lib/types/database.types';
import type { Event } from '$lib/types/entities/events';
import type { RaceResult } from '$lib/types/entities/race-results';
import type { RaceCategory } from '$lib/types/collections/race-category';
import type { RaceCategoryGender } from '$lib/types/collections/race-category-gender';
import type { RaceCategoryLength } from '$lib/types/collections/race-category-length';
import type { RaceRanking } from '$lib/types/collections/race-ranking';

// Base race type from Supabase
export type Race = Tables<'races'>;

// Extended race type with populated relationships
export interface RaceWithRelations extends Race {
	event?: Event;
	raceCategory?: RaceCategory;
	raceCategoryGender?: RaceCategoryGender;
	raceCategoryLength?: RaceCategoryLength;
	raceRanking?: RaceRanking;
	raceResults?: RaceResult[];
}

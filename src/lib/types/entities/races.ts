import type { Event } from '$lib/types/entities/events';
import type { RaceResult } from '$lib/types/entities/race-results';
import type { RaceCategory } from '$lib/types/collections/race-category';
import type { RaceCategoryGender } from '$lib/types/collections/race-category-gender';
import type { RaceCategoryLength } from '$lib/types/collections/race-category-length';
import type { RaceRanking } from '$lib/types/collections/race-ranking';

export interface Race {
	id: string;
	documentId: string;
	description?: string;
	event?: Event;
	dateTime: Date;
	name?: string;
	raceCategory: RaceCategory;
	raceCategoryGender: RaceCategoryGender;
	raceCategoryLength: RaceCategoryLength;
	raceRanking: RaceRanking;
	raceResults: RaceResult[];
}

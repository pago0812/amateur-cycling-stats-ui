import type { RaceCategory } from '$lib/types/collections/race-category';
import type { RaceCategoryGender } from '$lib/types/collections/race-category-gender';
import type { RaceCategoryLength } from '$lib/types/collections/race-category-length';
import type { Race } from '$lib/types/entities/races';
import type { EventStatusType } from '$lib/types/collections/events';

export interface Event {
	id: string;
	documentId: string;
	name: string;
	description?: string;
	dateTime: Date;
	eventStatus: EventStatusType;
	year: number;
	country: string;
	state: string;
	city?: string;
	isPublicVisible: boolean;
	races: Race[];
	supportedRaceCategories: RaceCategory[];
	supportedRaceCategoryGenders: RaceCategoryGender[];
	supportedRaceCategoryLengths: RaceCategoryLength[];
}

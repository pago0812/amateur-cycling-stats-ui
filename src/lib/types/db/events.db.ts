import type { Tables } from '../database.types';
import type { RaceCategoryDB, RaceCategoryGenderDB, RaceCategoryLengthDB } from './lookup-tables.db';

/**
 * Database type for events table.
 * Use this instead of Tables<'events'> throughout the codebase.
 */
export type EventDB = Tables<'events'>;

/**
 * Response type for event with junction tables populated.
 * Used by getEventWithCategoriesById() service.
 */
export interface EventWithCategoriesResponse extends EventDB {
	supportedCategories: Array<{
		race_categories: RaceCategoryDB;
	}>;
	supportedGenders: Array<{
		race_category_genders: RaceCategoryGenderDB;
	}>;
	supportedLengths: Array<{
		race_category_lengths: RaceCategoryLengthDB;
	}>;
}

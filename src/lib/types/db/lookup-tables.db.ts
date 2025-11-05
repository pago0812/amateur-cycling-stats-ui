import type { Tables } from '../database.types';

/**
 * Database types for lookup/reference tables.
 * Use these instead of Tables<'table_name'> throughout the codebase.
 */

export type CyclistGenderDB = Tables<'cyclist_genders'>;
export type RaceCategoryDB = Tables<'race_categories'>;
export type RaceCategoryGenderDB = Tables<'race_category_genders'>;
export type RaceCategoryLengthDB = Tables<'race_category_lengths'>;
export type RaceRankingDB = Tables<'race_rankings'>;

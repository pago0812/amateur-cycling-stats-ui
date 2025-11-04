import type { Tables } from '$lib/types/database.types';

// Base type from Supabase
export type RaceCategoryGender = Tables<'race_category_genders'>;

// Enum for race category genders
export enum RaceCategoryGenderEnum {
	FEMALE = 'FEMALE',
	MALE = 'MALE',
	OPEN = 'OPEN'
}

import type { Tables } from '$lib/types/database.types';

// Base type from Supabase
export type CyclistGender = Tables<'cyclist_genders'>;

// Enum for cyclist genders
export enum CyclistGenderEnum {
	F = 'F',
	M = 'M'
}

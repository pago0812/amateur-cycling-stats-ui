import type { Tables } from '$lib/types/database.types';

// Base type from Supabase
export type RaceCategoryLength = Tables<'race_category_lengths'>;

export type RaceCategoryLengthType = `${RaceCategoryLengthEnum}`;

// Enum for race category lengths
export enum RaceCategoryLengthEnum {
	LONG = 'LONG',
	SHORT = 'SHORT',
	SPRINT = 'SPRINT',
	UNIQUE = 'UNIQUE'
}

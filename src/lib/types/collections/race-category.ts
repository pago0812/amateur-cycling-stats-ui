import type { Tables } from '$lib/types/database.types';

// Base type from Supabase
export type RaceCategory = Tables<'race_categories'>;

// Enum for race categories
export enum RaceCategoryEnum {
	ABS = 'ABS',
	ELITE = 'ELITE',
	ES_19_23 = 'ES_19_23',
	JA_13_14 = 'JA_13_14',
	JA_15_16 = 'JA_15_16',
	JA_17_18 = 'JA_17_18',
	MA = 'MA',
	MB = 'MB',
	MC = 'MC',
	MD = 'MD',
	ME = 'ME',
	R_18_29 = 'R_18_29',
	R_18_34 = 'R_18_34',
	R_18_39 = 'R_18_39',
	R_30_34 = 'R_30_34',
	R_30_39 = 'R_30_39',
	R_35_39 = 'R_35_39',
	R_40_44 = 'R_40_44',
	R_40_49 = 'R_40_49',
	R_45_49 = 'R_45_49',
	R_50_54 = 'R_50_54',
	R_50_59 = 'R_50_59',
	R_55_59 = 'R_55_59',
	R_60_64 = 'R_60_64',
	R_60_69 = 'R_60_69',
	R_65_69 = 'R_65_69'
}

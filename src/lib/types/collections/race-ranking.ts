import type { Tables } from '$lib/types/database.types';

// Base type from Supabase
export type RaceRanking = Tables<'race_rankings'>;

// Enum for common race ranking types
export enum RaceRankingEnum {
	UCI = 'UCI',
	NATIONAL = 'NATIONAL',
	REGIONAL = 'REGIONAL',
	CUSTOM = 'CUSTOM'
}

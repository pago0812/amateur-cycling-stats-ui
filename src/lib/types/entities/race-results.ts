import type { Tables } from '$lib/types/database.types';
import type { Cyclist } from '$lib/types/entities/cyclists';
import type { Race } from '$lib/types/entities/races';
import type { RankingPoint } from '$lib/types/entities/rankingPoints';

// Base race result type from Supabase
export type RaceResult = Tables<'race_results'>;

// Extended race result type with populated relationships
export interface RaceResultWithRelations extends RaceResult {
	cyclist?: Cyclist;
	race?: Race;
	rankingPoint?: RankingPoint;
}

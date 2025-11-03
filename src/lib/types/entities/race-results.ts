import type { Cyclist } from '$lib/types/entities/cyclists';
import type { Race } from '$lib/types/entities/races';
import type { RankingPoint } from '$lib/types/entities/rankingPoints';

export interface RaceResult {
	id: string;
	documentId: string;
	time: string;
	place: number;
	cyclist: Cyclist;
	rankingPoint: RankingPoint;
	race?: Race;
}

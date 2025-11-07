import type { RankingPointDB } from '$lib/types/db';
import type { RankingPoint } from '$lib/types/domain/ranking-point.domain';
import { mapTimestamps } from './common.adapter';

/**
 * Adapts a raw database ranking point row to domain RankingPoint type.
 * Transforms snake_case → camelCase.
 */
export function adaptRankingPointFromDb(
	dbRankingPoint:
		| RankingPointDB
		| {
				id: string;
				short_id: string; // NanoID (translates to domain.id)
				place: number;
				points: number;
				race_ranking_id: string;
				created_at: string;
				updated_at: string;
		  }
): RankingPoint {
	return {
		id: dbRankingPoint.short_id, // Translate: short_id → id
		place: dbRankingPoint.place,
		points: dbRankingPoint.points,
		raceRankingId: dbRankingPoint.race_ranking_id,
		...mapTimestamps(dbRankingPoint)
	};
}

import type { RaceRanking } from './race-ranking.domain';

/**
 * Ranking point domain type - points awarded per place in ranking systems.
 * All fields use camelCase convention.
 */
export interface RankingPoint {
	// Identity
	id: string;

	// Data
	place: number; // Position (1, 2, 3, etc.)
	points: number; // Points awarded for this place

	// Relationships (Foreign Keys)
	raceRankingId: string;

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

/**
 * Ranking point with populated relationships.
 * Used when fetching ranking points with race ranking info.
 */
export interface RankingPointWithRelations extends RankingPoint {
	// Populated relationships
	raceRanking?: RaceRanking;
}

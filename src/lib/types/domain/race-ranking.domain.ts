import type { RankingPoint } from './ranking-point.domain';

/**
 * Race ranking name enum
 */
export type RaceRankingName = 'UCI' | 'NATIONAL' | 'REGIONAL' | 'CUSTOM';

/**
 * Race ranking domain type - ranking system for races.
 * All fields use camelCase convention.
 */
export interface RaceRanking {
	// Identity
	id: string;

	// Basic Info
	name: RaceRankingName;
	description: string | null;

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

/**
 * Race ranking with populated relationships.
 * Used when fetching race ranking with its point structure.
 */
export interface RaceRankingWithRelations extends RaceRanking {
	// Populated relationships
	rankingPoints?: RankingPoint[];
}

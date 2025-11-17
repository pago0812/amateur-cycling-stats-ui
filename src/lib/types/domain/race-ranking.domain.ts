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

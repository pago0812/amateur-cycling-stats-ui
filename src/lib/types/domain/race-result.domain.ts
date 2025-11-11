import type { RaceWithRelations } from './race.domain';
import type { CyclistWithRelations } from './cyclist.domain';
import type { RankingPoint } from './ranking-point.domain';

/**
 * Race result domain type - performance record linking cyclist to race.
 * All fields use camelCase convention.
 */
export interface RaceResult {
	// Identity
	id: string;

	// Result Data
	place: number; // Final position
	time: string | null; // Finish time (HH:MM:SS format or null)
	points: number | null; // Points earned (may be null if not applicable)

	// Relationships (Foreign Keys)
	raceId: string;
	cyclistId: string;
	rankingPointId: string | null; // Points awarded per place in ranking system

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

/**
 * Race result with populated relationships.
 * Used when fetching results with cyclist info (including user names) and ranking points.
 */
export interface RaceResultWithRelations extends RaceResult {
	// Populated relationships
	race?: RaceWithRelations;
	cyclist?: CyclistWithRelations;
	rankingPoint?: RankingPoint;
}

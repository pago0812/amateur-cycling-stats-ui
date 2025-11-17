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

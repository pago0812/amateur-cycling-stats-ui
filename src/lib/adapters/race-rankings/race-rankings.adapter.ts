/**
 * Race Rankings Adapter
 *
 * Transforms database types (snake_case) to domain types (camelCase) for race rankings.
 */

import type { RaceRankingDB } from '$lib/types/db';
import type { RaceRanking } from '$lib/types/domain';
import { mapTimestamps } from '../common/common.adapter';

/**
 * Transform RaceRankingDB (database type) to RaceRanking (domain type).
 * Maps snake_case fields to camelCase.
 */
export function adaptRaceRankingFromDb(dbRaceRanking: RaceRankingDB): RaceRanking {
	return {
		// Identity
		id: dbRaceRanking.id,

		// Basic Info
		name: dbRaceRanking.name as RaceRanking['name'],
		description: dbRaceRanking.description,

		// Timestamps
		...mapTimestamps(dbRaceRanking)
	};
}

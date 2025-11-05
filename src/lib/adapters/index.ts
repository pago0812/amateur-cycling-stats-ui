/**
 * Adapters
 *
 * Transform database types (snake_case) to domain types (camelCase).
 * All adapters are type-safe with no 'any' types.
 */

// Common utilities
export { mapTimestamps, adaptArray, isDefined } from './common.adapter';

// Events
export { adaptEventFromDb, adaptEventWithRelationsFromDb } from './events.adapter';

// Races
export { adaptRaceFromDb, adaptRaceWithResultsFromDb } from './races.adapter';

// Race Results
export { adaptRaceResultFromDb, adaptRaceResultWithRelationsFromDb } from './race-results.adapter';

// Cyclists
export { adaptCyclistFromDb, adaptCyclistWithResultsFromDb } from './cyclists.adapter';

// Race Categories
export {
	adaptRaceCategoryFromDb,
	adaptRaceCategoryGenderFromDb,
	adaptRaceCategoryLengthFromDb
} from './race-categories.adapter';

// Ranking Points
export { adaptRankingPointFromDb } from './ranking-points.adapter';

// Users
export { adaptUserWithRelationsFromRpc } from './users.adapter';

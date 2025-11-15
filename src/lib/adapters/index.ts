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
export {
	adaptRaceResultFromDb,
	adaptRaceResultWithRelationsFromDb,
	adaptRaceResultFromRpc
} from './race-results.adapter';

// Cyclists
export { adaptCyclistFromRpc } from './cyclists.adapter';

// Race Categories
export {
	adaptRaceCategoryFromDb,
	adaptRaceCategoryGenderFromDb,
	adaptRaceCategoryLengthFromDb
} from './race-categories.adapter';

// Ranking Points
export { adaptRankingPointFromDb } from './ranking-points.adapter';

// Users
export { adaptAuthUserFromRpc } from './users.adapter';

// Admin
export { adaptAdminFromRpc } from './admin.adapter';

// Roles
export { adaptRoleFromDb } from './roles.adapter';

// Organizations
export { adaptOrganizationFromDb } from './organizations.adapter';

// Organizers
export {
	adaptOrganizerFromDb,
	adaptOrganizerFromRpc,
	adaptOrganizerWithUserFromDb
} from './organizers.adapter';

// Race Rankings
export { adaptRaceRankingFromDb } from './race-rankings.adapter';

// Cyclist Genders
export { adaptCyclistGenderFromDb } from './cyclist-genders.adapter';

/**
 * Adapters
 *
 * Transform database types (snake_case) to domain types (camelCase).
 * All adapters are type-safe with no 'any' types.
 */

// Common utilities
export { mapTimestamps, adaptArray, isDefined } from './common/common.adapter';

// Events
export { adaptEventFromDb, adaptEventWithRacesFromDb } from './events/events.adapter';

// Races
export {
	adaptRaceFromDb,
	adaptRaceWithResultsFromDb,
	adaptRaceWithRaceResultsFromRpc
} from './races/races.adapter';

// Race Results
export {
	adaptRaceResultFromRpc,
	adaptRaceResultsFromRpc,
	adaptRaceResultFromNested
} from './race-results/race-results.adapter';

// Cyclists
export { adaptCyclistFromRpc } from './cyclists/cyclists.adapter';

// Race Categories
export {
	adaptRaceCategoryFromDb,
	adaptRaceCategoryGenderFromDb,
	adaptRaceCategoryLengthFromDb,
	adaptRaceCategoryFromRpc,
	adaptRaceCategoryGenderFromRpc,
	adaptRaceCategoryLengthFromRpc
} from './race-categories/race-categories.adapter';

// Ranking Points
export { adaptRankingPointFromDb } from './ranking-points/ranking-points.adapter';

// Users
export { adaptAuthUserFromRpc } from './users/users.adapter';

// Admin
export { adaptAdminFromRpc } from './admin/admin.adapter';

// Roles
export { adaptRoleFromDb } from './roles/roles.adapter';

// Organizations
export { adaptOrganizationFromDb } from './organizations/organizations.adapter';

// Organization Invitations
export { adaptOrganizationInvitationFromDb } from './organization-invitations/organization-invitations.adapter';

// Organizers
export {
	adaptOrganizerFromDb,
	adaptOrganizerFromAuthUserRpc,
	adaptOrganizerFromRpc
} from './organizers/organizers.adapter';

// Race Rankings
export { adaptRaceRankingFromDb } from './race-rankings/race-rankings.adapter';

// Cyclist Genders
export { adaptCyclistGenderFromDb } from './cyclist-genders/cyclist-genders.adapter';

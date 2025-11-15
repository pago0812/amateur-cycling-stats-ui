/**
 * Database types - Explicit type aliases for Supabase tables.
 *
 * This module provides clean, explicit type aliases for all database tables
 * instead of using Tables<'table_name'> directly throughout the codebase.
 *
 * Naming convention: TableNameDB (e.g., CyclistDB, EventDB)
 *
 * @example
 * ```typescript
 * import type { CyclistDB, EventDB } from '$lib/types/db';
 *
 * function adaptCyclist(dbCyclist: CyclistDB): Cyclist {
 *   // Transform database type to domain type
 * }
 * ```
 */

// Main entity types
export type {
	CyclistDB,
	CyclistInsert,
	CyclistWithResultsResponse,
	CyclistWithResultsRpcResponse
} from './cyclists.db';
export type { EventDB, EventWithCategoriesResponse } from './events.db';
export type { RaceDB, RaceWithResultsResponse } from './races.db';
export type { RaceResultDB, RaceResultWithRelationsResponse } from './race-results.db';
export type { UserDB, AuthUserRpcResponse, UserWithRelationsRpcResponse } from './users.db';
export type { RoleDB } from './roles.db';
export type { OrganizationDB } from './organizations.db';
export type { OrganizationInvitationDB } from './organization-invitations.db';
export type { OrganizerDB, OrganizerWithUserResponse } from './organizers.db';
export type { RankingPointDB } from './ranking-points.db';

// Lookup/reference table types
export type {
	CyclistGenderDB,
	RaceCategoryDB,
	RaceCategoryGenderDB,
	RaceCategoryLengthDB,
	RaceRankingDB
} from './lookup-tables.db';

// Junction table types
export type {
	EventSupportedCategoryDB,
	EventSupportedGenderDB,
	EventSupportedLengthDB
} from './event-junction-tables.db';

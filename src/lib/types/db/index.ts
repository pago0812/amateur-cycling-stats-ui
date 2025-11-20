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

// Common database types
export type { TypedSupabaseClient } from './common.db';

// Main entity types
export type { CyclistDB, CyclistInsertDB } from './cyclists.db';
export type { RaceResultDB, RaceResultTableDB } from './race-results.db';
export type { EventDB, EventWithRacesResponse } from './events.db';
export type { RaceDB, RaceWithResultsResponse, RpcRaceWithResultsResponse } from './races.db';
export type { UserDB, AuthUserDB } from './users.db';
export type { OrganizationDB, OrganizationTableDB } from './organizations.db';
export type { OrganizationInvitationDB } from './organization-invitations.db';
export type { OrganizerDB, OrganizerTableDB } from './organizers.db';
export type { OrganizerSetupResponseDB } from './organizer-setup.db';
export type { RankingPointDB } from './ranking-points.db';

// Lookup/reference table types
export type {
	CyclistGenderDB,
	RaceCategoryDB,
	RaceCategoryGenderDB,
	RaceCategoryLengthDB,
	RaceRankingDB
} from './lookup-tables.db';

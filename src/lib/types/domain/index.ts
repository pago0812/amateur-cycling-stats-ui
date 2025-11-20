/**
 * Domain Types
 *
 * All domain types use camelCase convention.
 * These types represent the application's business logic layer.
 * They are adapted from database types (snake_case) via adapters.
 */

// ============================================================================
// Enums (require regular export, not export type)
// ============================================================================
export { RoleTypeEnum } from './role-type.domain';

// ============================================================================
// User & Authentication
// ============================================================================
export type { User, UserOld } from './user.domain';
export type { Role } from './role.domain';
export type { Admin } from './admin.domain';
export type { Cyclist } from './cyclist.domain';
export type { CyclistGender } from './cyclist-gender.domain';

// ============================================================================
// Organizations & Organizers
// ============================================================================
export type {
	Organization,
	OrganizationState,
	PartialOrganization
} from './organization.domain';
export type {
	OrganizationInvitation,
	OrganizationInvitationStatus
} from './organization-invitation.domain';
export type { Organizer } from './organizer.domain';

// ============================================================================
// Events & Races
// ============================================================================
export type { Event, EventStatus } from './event.domain';
export type { Race, RaceWithRelations } from './race.domain';
export type { RaceResult } from './race-result.domain';

// ============================================================================
// Reference Data & Lookup Tables
// ============================================================================
export type { RaceCategory, RaceCategoryGender, RaceCategoryLength } from './race-category.domain';
export type { RaceRanking, RaceRankingName } from './race-ranking.domain';
export type { RankingPoint } from './ranking-point.domain';

/**
 * Domain Types
 *
 * All domain types use camelCase convention.
 * These types represent the application's business logic layer.
 * They are adapted from database types (snake_case) via adapters.
 */

// Core entities
export type { Event, EventWithRelations, EventStatus } from './event.domain';
export type { Race, RaceWithRelations } from './race.domain';
export type { RaceResult, RaceResultWithRelations } from './race-result.domain';
export type { Cyclist, CyclistWithRelations } from './cyclist.domain';
export type { User, UserWithRelations } from './user.domain';
export type { Organization, OrganizationWithRelations } from './organization.domain';
export type { Role, RoleName } from './role.domain';
export { RoleTypeEnum } from './role-type.domain';
export type { Organizer, OrganizerWithRelations } from './organizer.domain';

// Lookup tables
export type { RaceCategory, RaceCategoryGender, RaceCategoryLength } from './race-category.domain';
export type { CyclistGender } from './cyclist-gender.domain';
export type { RaceRanking, RaceRankingName, RaceRankingWithRelations } from './race-ranking.domain';
export type { RankingPoint, RankingPointWithRelations } from './ranking-point.domain';

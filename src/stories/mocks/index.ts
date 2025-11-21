/**
 * Mock Data for Storybook Stories
 *
 * Comprehensive mock data matching domain types for all custom components.
 * All data uses camelCase convention matching domain types.
 */

import type {
	Admin,
	Cyclist,
	Organizer,
	Organization,
	Event,
	Race,
	RaceResult
} from '$lib/types/domain';
import type { RaceDetailResult } from '$lib/types/services/races';
import { RoleTypeEnum } from '$lib/types/domain';

// ============================================================================
// Users & Authentication
// ============================================================================

export const mockAdmin: Admin = {
	id: '00000000-0000-0000-0000-000000000001',
	firstName: 'Admin',
	lastName: 'User',
	email: 'admin@acs.com',
	displayName: 'Admin User',
	hasAuth: true,
	roleType: RoleTypeEnum.ADMIN,
	createdAt: '2024-01-01T00:00:00Z',
	updatedAt: '2024-01-01T00:00:00Z'
};

export const mockCyclist: Cyclist = {
	id: '00000000-0000-0000-0000-000000000002',
	firstName: 'Maria',
	lastName: 'Rodriguez',
	email: 'maria.rodriguez@example.com',
	displayName: 'Maria Rodriguez',
	hasAuth: true,
	roleType: RoleTypeEnum.CYCLIST,
	genderName: 'F',
	bornYear: 1995,
	createdAt: '2024-01-15T00:00:00Z',
	updatedAt: '2024-01-15T00:00:00Z'
};

export const mockCyclist2: Cyclist = {
	id: '00000000-0000-0000-0000-000000000003',
	firstName: 'Juan',
	lastName: 'Lopez',
	email: null, // Unregistered cyclist
	displayName: null,
	hasAuth: false,
	roleType: null,
	genderName: 'M',
	bornYear: 1992,
	createdAt: '2024-01-20T00:00:00Z',
	updatedAt: '2024-01-20T00:00:00Z'
};

export const mockOrganizerOwner: Organizer = {
	id: '00000000-0000-0000-0000-000000000004',
	firstName: 'Ana',
	lastName: 'Garcia',
	email: 'ana.garcia@example.com',
	displayName: 'Ana Garcia',
	hasAuth: true,
	roleType: RoleTypeEnum.ORGANIZER_OWNER,
	organizationId: '00000000-0000-0000-0000-000000000101',
	createdAt: '2024-02-01T00:00:00Z',
	updatedAt: '2024-02-01T00:00:00Z'
};

export const mockOrganizerStaff: Organizer = {
	id: '00000000-0000-0000-0000-000000000005',
	firstName: 'Carlos',
	lastName: 'Martinez',
	email: 'carlos.martinez@example.com',
	displayName: 'Carlos Martinez',
	hasAuth: true,
	roleType: RoleTypeEnum.ORGANIZER_STAFF,
	organizationId: '00000000-0000-0000-0000-000000000101',
	createdAt: '2024-02-05T00:00:00Z',
	updatedAt: '2024-02-05T00:00:00Z'
};

// ============================================================================
// Organizations
// ============================================================================

export const mockOrganizationActive: Organization = {
	id: '00000000-0000-0000-0000-000000000101',
	name: 'Catalonia Cycling Federation',
	description: 'Official cycling federation for Catalonia region',
	state: 'ACTIVE',
	eventCount: 15,
	createdAt: '2024-01-01T00:00:00Z',
	updatedAt: '2024-01-01T00:00:00Z'
};

export const mockOrganizationWaitingOwner: Organization = {
	id: '00000000-0000-0000-0000-000000000102',
	name: 'Valencia Bike Club',
	description: 'Community cycling club in Valencia',
	state: 'WAITING_OWNER',
	eventCount: 0,
	createdAt: '2024-03-01T00:00:00Z',
	updatedAt: '2024-03-01T00:00:00Z'
};

export const mockOrganizationDisabled: Organization = {
	id: '00000000-0000-0000-0000-000000000103',
	name: 'Madrid Cycling League',
	description: 'Inactive cycling organization',
	state: 'DISABLED',
	eventCount: 5,
	createdAt: '2023-06-01T00:00:00Z',
	updatedAt: '2024-02-15T00:00:00Z'
};

export const mockOrganizations: Organization[] = [
	mockOrganizationActive,
	mockOrganizationWaitingOwner,
	mockOrganizationDisabled
];

export const mockOrganizers: Organizer[] = [mockOrganizerOwner, mockOrganizerStaff];

// ============================================================================
// Events
// ============================================================================

export const mockEventUpcoming: Event = {
	id: '00000000-0000-0000-0000-000000000201',
	name: 'Gran Fondo Catalunya 2025',
	description: 'Annual cycling event through the beautiful landscapes of Catalonia',
	dateTime: '2025-05-15T09:00:00Z',
	year: 2025,
	city: 'Barcelona' as string,
	state: 'Catalunya' as string,
	country: 'España' as string,
	eventStatus: 'AVAILABLE',
	organizationId: mockOrganizationActive.id,
	createdBy: mockOrganizerOwner.id,
	isPublicVisible: true,
	createdAt: '2024-12-01T00:00:00Z',
	updatedAt: '2024-12-01T00:00:00Z'
};

export const mockEventPast: Event = {
	id: '00000000-0000-0000-0000-000000000202',
	name: 'Valencia Coastal Challenge 2024',
	description: 'Scenic coastal cycling race along the Mediterranean',
	dateTime: '2024-10-20T08:30:00Z',
	year: 2024,
	city: 'Valencia' as string,
	state: 'Valencia' as string,
	country: 'España' as string,
	eventStatus: 'FINISHED',
	organizationId: mockOrganizationActive.id,
	createdBy: mockOrganizerOwner.id,
	isPublicVisible: true,
	createdAt: '2024-07-01T00:00:00Z',
	updatedAt: '2024-10-21T00:00:00Z'
};

export const mockEventsUpcoming: Event[] = [mockEventUpcoming];
export const mockEventsPast: Event[] = [mockEventPast];

// ============================================================================
// Races
// ============================================================================

export const mockRace: Race = {
	id: '00000000-0000-0000-0000-000000000301',
	name: 'Elite Men Long Distance',
	description: 'Championship race for elite male cyclists',
	dateTime: '2025-05-15T09:00:00Z',
	eventId: mockEventUpcoming.id,
	raceCategoryId: 'cat-elite',
	raceCategoryGenderId: 'gender-male',
	raceCategoryLengthId: 'length-long',
	raceRankingId: 'rank-uci',
	isPublicVisible: true,
	createdAt: '2024-12-01T00:00:00Z',
	updatedAt: '2024-12-01T00:00:00Z'
};

// ============================================================================
// Race Results
// ============================================================================

export const mockRaceResult1: RaceResult = {
	id: '00000000-0000-0000-0000-000000000401',
	place: 1,
	time: '03:25:15',
	points: 100,
	eventId: mockEventPast.id,
	raceId: mockRace.id,
	raceCategoryId: 'cat-elite',
	raceCategoryGenderId: 'gender-male',
	raceCategoryLengthId: 'length-long',
	eventName: 'Valencia Coastal Challenge 2024',
	eventDateTime: '2024-10-20T08:30:00Z',
	eventYear: 2024,
	eventCity: 'Valencia',
	eventState: 'Valencia',
	eventCountry: 'España',
	eventStatus: 'FINISHED',
	raceName: 'Elite Men Long Distance',
	raceDateTime: '2024-10-20T08:30:00Z',
	raceCategoryType: 'ELITE',
	raceCategoryGenderType: 'MALE',
	raceCategoryLengthType: 'LONG',
	raceRankingType: 'UCI',
	createdAt: '2024-10-20T12:00:00Z',
	updatedAt: '2024-10-20T12:00:00Z'
};

export const mockRaceResult2: RaceResult = {
	id: '00000000-0000-0000-0000-000000000402',
	place: 2,
	time: '03:27:45',
	points: 80,
	eventId: mockEventPast.id,
	raceId: mockRace.id,
	raceCategoryId: 'cat-elite',
	raceCategoryGenderId: 'gender-male',
	raceCategoryLengthId: 'length-long',
	eventName: 'Valencia Coastal Challenge 2024',
	eventDateTime: '2024-10-20T08:30:00Z',
	eventYear: 2024,
	eventCity: 'Valencia',
	eventState: 'Valencia',
	eventCountry: 'España',
	eventStatus: 'FINISHED',
	raceName: 'Elite Men Long Distance',
	raceDateTime: '2024-10-20T08:30:00Z',
	raceCategoryType: 'ELITE',
	raceCategoryGenderType: 'MALE',
	raceCategoryLengthType: 'LONG',
	raceRankingType: 'UCI',
	createdAt: '2024-10-20T12:00:00Z',
	updatedAt: '2024-10-20T12:00:00Z'
};

export const mockRaceResult3: RaceResult = {
	id: '00000000-0000-0000-0000-000000000403',
	place: 3,
	time: '03:30:12',
	points: 60,
	eventId: mockEventPast.id,
	raceId: mockRace.id,
	raceCategoryId: 'cat-elite',
	raceCategoryGenderId: 'gender-female',
	raceCategoryLengthId: 'length-long',
	eventName: 'Valencia Coastal Challenge 2024',
	eventDateTime: '2024-10-20T08:30:00Z',
	eventYear: 2024,
	eventCity: 'Valencia',
	eventState: 'Valencia',
	eventCountry: 'España',
	eventStatus: 'FINISHED',
	raceName: 'Elite Women Long Distance',
	raceDateTime: '2024-10-20T08:30:00Z',
	raceCategoryType: 'ELITE',
	raceCategoryGenderType: 'FEMALE',
	raceCategoryLengthType: 'LONG',
	raceRankingType: 'UCI',
	createdAt: '2024-10-20T12:00:00Z',
	updatedAt: '2024-10-20T12:00:00Z'
};

export const mockRaceResults: RaceResult[] = [
	mockRaceResult1,
	mockRaceResult2,
	mockRaceResult3
];

// ============================================================================
// Race Detail Results (for ResultsTable)
// ============================================================================

export const mockRaceDetailResult1: RaceDetailResult = {
	id: '00000000-0000-0000-0000-000000000501',
	place: 1,
	time: '03:25:15',
	points: 100,
	cyclistId: mockCyclist.id,
	cyclistFirstName: 'Maria',
	cyclistLastName: 'Rodriguez',
	createdAt: '2024-10-20T12:00:00Z',
	updatedAt: '2024-10-20T12:00:00Z'
};

export const mockRaceDetailResult2: RaceDetailResult = {
	id: '00000000-0000-0000-0000-000000000502',
	place: 2,
	time: '03:27:45',
	points: 80,
	cyclistId: mockCyclist2.id,
	cyclistFirstName: 'Juan',
	cyclistLastName: 'Lopez',
	createdAt: '2024-10-20T12:00:00Z',
	updatedAt: '2024-10-20T12:00:00Z'
};

export const mockRaceDetailResult3: RaceDetailResult = {
	id: '00000000-0000-0000-0000-000000000503',
	place: 3,
	time: '03:30:12',
	points: 60,
	cyclistId: mockCyclist.id,
	cyclistFirstName: 'Maria',
	cyclistLastName: 'Rodriguez',
	createdAt: '2024-10-20T12:00:00Z',
	updatedAt: '2024-10-20T12:00:00Z'
};

export const mockRaceDetailResults: RaceDetailResult[] = [
	mockRaceDetailResult1,
	mockRaceDetailResult2,
	mockRaceDetailResult3
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate array of mock race results for large tables
 */
export function generateMockRaceResults(count: number): RaceResult[] {
	return Array.from({ length: count }, (_, i) => ({
		...mockRaceResult1,
		id: `00000000-0000-0000-0000-${String(i + 1000).padStart(12, '0')}`,
		place: i + 1,
		points: Math.max(100 - i * 5, 0),
		time: `03:${String(25 + Math.floor(i / 60)).padStart(2, '0')}:${String(15 + (i % 60)).padStart(2, '0')}`
	}));
}

/**
 * Generate array of mock events
 */
export function generateMockEvents(count: number): Event[] {
	return Array.from({ length: count }, (_, i) => ({
		...mockEventUpcoming,
		id: `00000000-0000-0000-0000-${String(i + 2000).padStart(12, '0')}`,
		name: `Cycling Event ${i + 1}`,
		city: `City ${i + 1}`,
		year: 2025
	}));
}

/**
 * Generate array of mock organizations
 */
export function generateMockOrganizations(count: number): Organization[] {
	const states: Organization['state'][] = ['ACTIVE', 'WAITING_OWNER', 'DISABLED'];
	return Array.from({ length: count }, (_, i) => ({
		...mockOrganizationActive,
		id: `00000000-0000-0000-0000-${String(i + 3000).padStart(12, '0')}`,
		name: `Organization ${i + 1}`,
		state: states[i % 3],
		eventCount: Math.floor(Math.random() * 50)
	}));
}

/**
 * Generate array of mock race detail results
 */
export function generateMockRaceDetailResults(count: number): RaceDetailResult[] {
	const firstNames = ['Maria', 'Juan', 'Carlos', 'Ana', 'Pedro', 'Sofia'];
	const lastNames = ['Rodriguez', 'Lopez', 'Martinez', 'Garcia', 'Sanchez', 'Torres'];

	return Array.from({ length: count }, (_, i) => ({
		id: `00000000-0000-0000-0000-${String(i + 5000).padStart(12, '0')}`,
		place: i + 1,
		time: `03:${String(25 + Math.floor(i / 60)).padStart(2, '0')}:${String(15 + (i % 60)).padStart(2, '0')}`,
		points: Math.max(100 - i * 5, 0),
		cyclistId: `00000000-0000-0000-0000-${String(i + 6000).padStart(12, '0')}`,
		cyclistFirstName: firstNames[i % firstNames.length],
		cyclistLastName: lastNames[i % lastNames.length],
		createdAt: '2024-10-20T12:00:00Z',
		updatedAt: '2024-10-20T12:00:00Z'
	}));
}

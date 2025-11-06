/**
 * Test Data References
 *
 * Contains IDs and references to seed data for reliable E2E testing.
 * These values correspond to data created by seed.sql and seed-users.ts
 *
 * NOTE: If you reset the database (supabase db reset), these IDs may change.
 * Update this file after reseeding if needed.
 */

/**
 * Known event names from seed data
 * Use these to find events dynamically rather than hardcoding UUIDs
 */
export const TEST_EVENTS = {
	future: {
		// Event created with future date
		name: 'Valencia MTB Challenge 2026'
	},
	past: {
		// Event created with past date
		name: 'Gran Fondo Costa Blanca 2024'
	},
	draft: {
		// Event in draft status
		name: 'Alicante Criterium 2025'
	},
	ongoing: {
		// Event in ongoing status
		name: 'Sierra de Aitana Climb 2025'
	}
} as const;

/**
 * Known cyclist names from seed data
 * Both linked (with user accounts) and unlinked cyclists
 */
export const TEST_CYCLISTS = {
	linked: [
		// Cyclists with user accounts (from seed-users.ts)
		{ name: 'Carlos', lastName: 'Rodríguez' },
		{ name: 'María', lastName: 'García' },
		{ name: 'Javier', lastName: 'Martínez' }
	],
	unlinked: [
		// Cyclists without user accounts (from seed.sql)
		{ name: 'Ana', lastName: 'López' },
		{ name: 'Pedro', lastName: 'Sánchez' },
		{ name: 'Laura', lastName: 'Fernández' },
		{ name: 'Miguel', lastName: 'Torres' },
		{ name: 'Carmen', lastName: 'Ruiz' }
	]
} as const;

/**
 * Known organization names from seed data
 */
export const TEST_ORGANIZATIONS = {
	proCycling: 'Pro Cycling League Spain',
	valenciaFed: 'Valencia Cycling Federation'
} as const;

/**
 * Race category names for filter testing
 */
export const TEST_RACE_CATEGORIES = {
	ABS: 'ABS', // Absoluta
	ELITE: 'ELITE',
	MA30: 'MA-30',
	MA40: 'MA-40',
	MA50: 'MA-50'
} as const;

/**
 * Race category genders for filter testing
 */
export const TEST_GENDERS = {
	MALE: 'MALE', // Masculino
	FEMALE: 'FEMALE', // Femenino
	OPEN: 'OPEN' // Abierta
} as const;

/**
 * Race category lengths for filter testing
 */
export const TEST_LENGTHS = {
	LONG: 'LONG', // Larga
	SHORT: 'SHORT', // Corta
	SPRINT: 'SPRINT',
	UNIQUE: 'UNIQUE' // Única
} as const;

/**
 * Helper to get current year for filtering tests
 */
export const getCurrentYear = () => new Date().getFullYear();

/**
 * Helper to get past year for filtering tests
 */
export const getPastYear = () => new Date().getFullYear() - 1;

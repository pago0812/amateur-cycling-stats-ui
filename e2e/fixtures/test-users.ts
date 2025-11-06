/**
 * Test User Credentials
 *
 * These users are created by the seed-users.ts script.
 * DO NOT create new users in E2E tests until a separate test database is available.
 *
 * To reset test users, run: npm run seed:users
 */

export const TEST_USERS = {
	/**
	 * System administrator with full access
	 */
	admin: {
		email: 'admin@acs.com',
		password: '#admin123'
	},

	/**
	 * Regular cyclist user (Carlos Rodríguez)
	 * Has race results in the system
	 */
	cyclist1: {
		email: 'cyclist1@example.com',
		password: 'password123'
	},

	/**
	 * Regular cyclist user (María García)
	 * Has race results in the system
	 */
	cyclist2: {
		email: 'cyclist2@example.com',
		password: 'password123'
	},

	/**
	 * Regular cyclist user (Javier Martínez)
	 * Has race results in the system
	 */
	cyclist3: {
		email: 'cyclist3@example.com',
		password: 'password123'
	},

	/**
	 * Organizer admin for Pro Cycling League Spain
	 */
	organizer: {
		email: 'organizer@example.com',
		password: 'password123'
	},

	/**
	 * Organizer staff for Valencia Cycling Federation
	 */
	staff: {
		email: 'staff@example.com',
		password: 'password123'
	}
} as const;

export type TestUserKey = keyof typeof TEST_USERS;

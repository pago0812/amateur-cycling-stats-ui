/**
 * Seed Data Definitions
 *
 * Pure data definitions for seeding the database.
 * No Supabase logic, just TypeScript objects.
 */

// ============================================================================
// DATE HELPERS - Generate relative dates for consistent testing
// ============================================================================

function formatDateTime(date: Date): string {
	return date.toISOString().slice(0, 19).replace('T', ' ');
}

function getRelativeDate(monthsOffset: number): { dateTime: string; year: number } {
	const date = new Date();
	date.setMonth(date.getMonth() + monthsOffset);
	return {
		dateTime: formatDateTime(date),
		year: date.getFullYear()
	};
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface TestUser {
	id: string;
	email: string;
	password: string;
	username: string;
	roleName: 'admin' | 'organizer' | 'organizer_staff' | 'cyclist';
	cyclistData?: {
		name: string;
		lastName: string;
		bornYear: number;
		gender: 'M' | 'F';
	};
	organizerData?: {
		organizationName: string;
	};
}

export interface AnonymousCyclist {
	name: string;
	lastName: string;
	bornYear: number;
	gender: 'M' | 'F';
}

export interface EventData {
	id: string;
	name: string;
	city: string;
	country: string;
	state: string;
	dateTime: string;
	year: number;
	eventStatus: 'FINISHED' | 'AVAILABLE' | 'DRAFT' | 'ON_GOING';
	isPublicVisible: boolean;
	createdByUserId: string;
	organizationName: string;
	supportedCategories: string[]; // Race category names
	supportedGenders: string[]; // Race gender names
	supportedLengths: string[]; // Race length names
}

export interface RaceData {
	eventId: string;
	dateTime: string;
	categoryName: string; // ELITE, MA
	genderName: string; // MALE, FEMALE
	lengthName: string; // LONG, SHORT
	rankingName: string; // UCI, NATIONAL, REGIONAL, CUSTOM
	isPublicVisible: boolean;
}

export interface RaceResultData {
	eventId: string;
	categoryName: string;
	genderName: string;
	lengthName: string; // LONG, SHORT - needed to identify which race
	cyclistIdentifier: string; // Can be user ID or anonymous cyclist index
	place: number;
	time: string | null;
	rankingName: string;
}

// ============================================================================
// USER DATA
// ============================================================================

export const seedUsers: TestUser[] = [
	{
		id: 'a0000000-0000-0000-0000-000000000001',
		email: 'admin@acs.com',
		password: '#admin123',
		username: 'admin',
		roleName: 'admin'
	},
	{
		id: 'b0000000-0000-0000-0000-000000000001',
		email: 'organizer@example.com',
		password: 'password123',
		username: 'organizer1',
		roleName: 'organizer',
		organizerData: {
			organizationName: 'Pro Cycling League Spain'
		}
	},
	{
		id: 'b0000000-0000-0000-0000-000000000002',
		email: 'staff@example.com',
		password: 'password123',
		username: 'staff1',
		roleName: 'organizer_staff',
		organizerData: {
			organizationName: 'Valencia Cycling Federation'
		}
	},
	{
		id: 'c0000000-0000-0000-0000-000000000001',
		email: 'cyclist1@example.com',
		password: 'password123',
		username: 'cyclist1',
		roleName: 'cyclist',
		cyclistData: {
			name: 'Carlos',
			lastName: 'Rodríguez',
			bornYear: 1995,
			gender: 'M'
		}
	},
	{
		id: 'c0000000-0000-0000-0000-000000000002',
		email: 'cyclist2@example.com',
		password: 'password123',
		username: 'cyclist2',
		roleName: 'cyclist',
		cyclistData: {
			name: 'María',
			lastName: 'García',
			bornYear: 1998,
			gender: 'F'
		}
	},
	{
		id: 'c0000000-0000-0000-0000-000000000003',
		email: 'cyclist3@example.com',
		password: 'password123',
		username: 'cyclist3',
		roleName: 'cyclist',
		cyclistData: {
			name: 'Javier',
			lastName: 'Martínez',
			bornYear: 1992,
			gender: 'M'
		}
	}
];

// ============================================================================
// ANONYMOUS CYCLIST DATA (45 cyclists)
// ============================================================================

export const seedAnonymousCyclists: AnonymousCyclist[] = [
	// ELITE MALE (12 cyclists) - Ages 20-35 (born 1990-2005)
	{ name: 'Alberto', lastName: 'Fernández', bornYear: 1997, gender: 'M' },
	{ name: 'Diego', lastName: 'Sánchez', bornYear: 1993, gender: 'M' },
	{ name: 'Pablo', lastName: 'López', bornYear: 1999, gender: 'M' },
	{ name: 'Alejandro', lastName: 'González', bornYear: 1996, gender: 'M' },
	{ name: 'Sergio', lastName: 'Pérez', bornYear: 2001, gender: 'M' },
	{ name: 'Rubén', lastName: 'Martín', bornYear: 1994, gender: 'M' },
	{ name: 'Iván', lastName: 'Jiménez', bornYear: 2000, gender: 'M' },
	{ name: 'Adrián', lastName: 'Ruiz', bornYear: 1998, gender: 'M' },
	{ name: 'David', lastName: 'Hernández', bornYear: 1995, gender: 'M' },
	{ name: 'Miguel', lastName: 'Díaz', bornYear: 2002, gender: 'M' },
	{ name: 'Raúl', lastName: 'Moreno', bornYear: 1991, gender: 'M' },
	{ name: 'Fernando', lastName: 'Muñoz', bornYear: 1997, gender: 'M' },

	// ELITE FEMALE (12 cyclists) - Ages 20-35 (born 1990-2005)
	{ name: 'Ana', lastName: 'Torres', bornYear: 1996, gender: 'F' },
	{ name: 'Laura', lastName: 'Ramírez', bornYear: 1999, gender: 'F' },
	{ name: 'Carmen', lastName: 'Vargas', bornYear: 1994, gender: 'F' },
	{ name: 'Sofía', lastName: 'Castro', bornYear: 2000, gender: 'F' },
	{ name: 'Marta', lastName: 'Ortiz', bornYear: 1997, gender: 'F' },
	{ name: 'Elena', lastName: 'Romero', bornYear: 1995, gender: 'F' },
	{ name: 'Paula', lastName: 'Navarro', bornYear: 2001, gender: 'F' },
	{ name: 'Beatriz', lastName: 'Iglesias', bornYear: 1998, gender: 'F' },
	{ name: 'Cristina', lastName: 'Gil', bornYear: 1993, gender: 'F' },
	{ name: 'Isabel', lastName: 'Santos', bornYear: 2002, gender: 'F' },
	{ name: 'Lucía', lastName: 'Serrano', bornYear: 1996, gender: 'F' },
	{ name: 'Silvia', lastName: 'Molina', bornYear: 1999, gender: 'F' },

	// MA MALE (12 cyclists) - Ages 30-45 (born 1980-1994)
	{ name: 'Antonio', lastName: 'Ramos', bornYear: 1987, gender: 'M' },
	{ name: 'José', lastName: 'Vega', bornYear: 1985, gender: 'M' },
	{ name: 'Manuel', lastName: 'Méndez', bornYear: 1990, gender: 'M' },
	{ name: 'Francisco', lastName: 'Cruz', bornYear: 1983, gender: 'M' },
	{ name: 'Juan', lastName: 'Reyes', bornYear: 1988, gender: 'M' },
	{ name: 'Pedro', lastName: 'Flores', bornYear: 1986, gender: 'M' },
	{ name: 'Luis', lastName: 'Herrera', bornYear: 1991, gender: 'M' },
	{ name: 'Ricardo', lastName: 'Aguilar', bornYear: 1984, gender: 'M' },
	{ name: 'Rafael', lastName: 'Cabrera', bornYear: 1989, gender: 'M' },
	{ name: 'Ángel', lastName: 'Prieto', bornYear: 1982, gender: 'M' },
	{ name: 'Víctor', lastName: 'Cortés', bornYear: 1987, gender: 'M' },
	{ name: 'Enrique', lastName: 'Campos', bornYear: 1990, gender: 'M' },

	// MA FEMALE (9 cyclists) - Ages 30-45 (born 1980-1994)
	{ name: 'Rosa', lastName: 'Domínguez', bornYear: 1988, gender: 'F' },
	{ name: 'Pilar', lastName: 'Blanco', bornYear: 1986, gender: 'F' },
	{ name: 'Teresa', lastName: 'Suárez', bornYear: 1991, gender: 'F' },
	{ name: 'Mercedes', lastName: 'Vidal', bornYear: 1984, gender: 'F' },
	{ name: 'Dolores', lastName: 'Carrasco', bornYear: 1989, gender: 'F' },
	{ name: 'Rocío', lastName: 'León', bornYear: 1987, gender: 'F' },
	{ name: 'Nuria', lastName: 'Mora', bornYear: 1990, gender: 'F' },
	{ name: 'Amparo', lastName: 'Lozano', bornYear: 1985, gender: 'F' },
	{ name: 'Montserrat', lastName: 'Cano', bornYear: 1992, gender: 'F' }
];

// ============================================================================
// EVENT DATA (5 events)
// ============================================================================

// Generate relative dates for events
const pastEvent1Date = getRelativeDate(-6); // 6 months ago
const pastEvent2Date = getRelativeDate(-3); // 3 months ago
const pastEvent3Date = getRelativeDate(-1); // 1 month ago
const futureEvent1Date = getRelativeDate(2); // 2 months from now
const draftEvent1Date = getRelativeDate(4); // 4 months from now

export const seedEvents: EventData[] = [
	// Past Event 1 (FINISHED)
	{
		id: 'e0000000-0000-0000-0000-000000000001',
		name: `Gran Fondo Madrid ${pastEvent1Date.year}`,
		city: 'Madrid',
		country: 'España',
		state: 'Madrid',
		dateTime: pastEvent1Date.dateTime,
		year: pastEvent1Date.year,
		eventStatus: 'FINISHED',
		isPublicVisible: true,
		createdByUserId: 'b0000000-0000-0000-0000-000000000001',
		organizationName: 'Pro Cycling League Spain',
		supportedCategories: ['ELITE', 'MA'],
		supportedGenders: ['MALE', 'FEMALE'],
		supportedLengths: ['LONG', 'SHORT']
	},
	// Past Event 2 (FINISHED)
	{
		id: 'e0000000-0000-0000-0000-000000000002',
		name: `Vuelta a Valencia Amateur ${pastEvent2Date.year}`,
		city: 'Valencia',
		country: 'España',
		state: 'Valencia',
		dateTime: pastEvent2Date.dateTime,
		year: pastEvent2Date.year,
		eventStatus: 'FINISHED',
		isPublicVisible: true,
		createdByUserId: 'b0000000-0000-0000-0000-000000000002',
		organizationName: 'Valencia Cycling Federation',
		supportedCategories: ['ELITE', 'MA'],
		supportedGenders: ['MALE', 'FEMALE'],
		supportedLengths: ['LONG', 'SHORT']
	},
	// Past Event 3 (FINISHED)
	{
		id: 'e0000000-0000-0000-0000-000000000003',
		name: `Copa Andalucía ${pastEvent3Date.year}`,
		city: 'Sevilla',
		country: 'España',
		state: 'Andalucía',
		dateTime: pastEvent3Date.dateTime,
		year: pastEvent3Date.year,
		eventStatus: 'FINISHED',
		isPublicVisible: true,
		createdByUserId: 'b0000000-0000-0000-0000-000000000001',
		organizationName: 'Pro Cycling League Spain',
		supportedCategories: ['ELITE', 'MA'],
		supportedGenders: ['MALE', 'FEMALE'],
		supportedLengths: ['LONG', 'SHORT']
	},
	// Future Event (AVAILABLE)
	{
		id: 'e0000000-0000-0000-0000-000000000004',
		name: `Tour de Cataluña Amateur ${futureEvent1Date.year}`,
		city: 'Barcelona',
		country: 'España',
		state: 'Cataluña',
		dateTime: futureEvent1Date.dateTime,
		year: futureEvent1Date.year,
		eventStatus: 'AVAILABLE',
		isPublicVisible: true,
		createdByUserId: 'b0000000-0000-0000-0000-000000000002',
		organizationName: 'Valencia Cycling Federation',
		supportedCategories: ['ELITE', 'MA'],
		supportedGenders: ['MALE', 'FEMALE'],
		supportedLengths: ['LONG', 'SHORT']
	},
	// Draft Event (DRAFT)
	{
		id: 'e0000000-0000-0000-0000-000000000005',
		name: `Test Event ${draftEvent1Date.year}`,
		city: 'Bilbao',
		country: 'España',
		state: 'País Vasco',
		dateTime: draftEvent1Date.dateTime,
		year: draftEvent1Date.year,
		eventStatus: 'DRAFT',
		isPublicVisible: false,
		createdByUserId: 'b0000000-0000-0000-0000-000000000001',
		organizationName: 'Pro Cycling League Spain',
		supportedCategories: ['ELITE', 'MA'],
		supportedGenders: ['MALE', 'FEMALE'],
		supportedLengths: ['LONG', 'SHORT']
	}
];

// ============================================================================
// RACE DATA (20 races = 4 races × 5 events)
// ============================================================================

// Helper to add minutes to a date string
function addMinutesToDate(dateTimeStr: string, minutes: number): string {
	const date = new Date(dateTimeStr.replace(' ', 'T'));
	date.setMinutes(date.getMinutes() + minutes);
	return formatDateTime(date);
}

export const seedRaces: RaceData[] = [
	// Event 1 - Past (FINISHED) - ELITE races
	{
		eventId: 'e0000000-0000-0000-0000-000000000001',
		dateTime: pastEvent1Date.dateTime,
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'LONG',
		rankingName: 'UCI',
		isPublicVisible: true
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000001',
		dateTime: addMinutesToDate(pastEvent1Date.dateTime, 15),
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'SHORT',
		rankingName: 'UCI',
		isPublicVisible: true
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000001',
		dateTime: addMinutesToDate(pastEvent1Date.dateTime, 60),
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'LONG',
		rankingName: 'UCI',
		isPublicVisible: true
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000001',
		dateTime: addMinutesToDate(pastEvent1Date.dateTime, 75),
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		rankingName: 'UCI',
		isPublicVisible: true
	},

	// Event 2 - Past (FINISHED) - MA races
	{
		eventId: 'e0000000-0000-0000-0000-000000000002',
		dateTime: pastEvent2Date.dateTime,
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'LONG',
		rankingName: 'NATIONAL',
		isPublicVisible: true
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000002',
		dateTime: addMinutesToDate(pastEvent2Date.dateTime, 15),
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'SHORT',
		rankingName: 'NATIONAL',
		isPublicVisible: true
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000002',
		dateTime: addMinutesToDate(pastEvent2Date.dateTime, 60),
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'LONG',
		rankingName: 'NATIONAL',
		isPublicVisible: true
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000002',
		dateTime: addMinutesToDate(pastEvent2Date.dateTime, 75),
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		rankingName: 'NATIONAL',
		isPublicVisible: true
	},

	// Event 3 - Past (FINISHED) - Mixed ELITE and MA
	{
		eventId: 'e0000000-0000-0000-0000-000000000003',
		dateTime: pastEvent3Date.dateTime,
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'LONG',
		rankingName: 'REGIONAL',
		isPublicVisible: true
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000003',
		dateTime: addMinutesToDate(pastEvent3Date.dateTime, 15),
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		rankingName: 'REGIONAL',
		isPublicVisible: true
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000003',
		dateTime: addMinutesToDate(pastEvent3Date.dateTime, 60),
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'LONG',
		rankingName: 'REGIONAL',
		isPublicVisible: true
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000003',
		dateTime: addMinutesToDate(pastEvent3Date.dateTime, 75),
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		rankingName: 'REGIONAL',
		isPublicVisible: true
	},

	// Event 4 - Future (AVAILABLE) - Mixed
	{
		eventId: 'e0000000-0000-0000-0000-000000000004',
		dateTime: futureEvent1Date.dateTime,
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'LONG',
		rankingName: 'NATIONAL',
		isPublicVisible: true
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000004',
		dateTime: addMinutesToDate(futureEvent1Date.dateTime, 15),
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'LONG',
		rankingName: 'NATIONAL',
		isPublicVisible: true
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000004',
		dateTime: addMinutesToDate(futureEvent1Date.dateTime, 60),
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'SHORT',
		rankingName: 'NATIONAL',
		isPublicVisible: true
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000004',
		dateTime: addMinutesToDate(futureEvent1Date.dateTime, 75),
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		rankingName: 'NATIONAL',
		isPublicVisible: true
	},

	// Event 5 - Draft (DRAFT) - Mixed visibility
	{
		eventId: 'e0000000-0000-0000-0000-000000000005',
		dateTime: draftEvent1Date.dateTime,
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'SHORT',
		rankingName: 'CUSTOM',
		isPublicVisible: false
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000005',
		dateTime: addMinutesToDate(draftEvent1Date.dateTime, 15),
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'LONG',
		rankingName: 'CUSTOM',
		isPublicVisible: false
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000005',
		dateTime: addMinutesToDate(draftEvent1Date.dateTime, 60),
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'LONG',
		rankingName: 'CUSTOM',
		isPublicVisible: true
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000005',
		dateTime: addMinutesToDate(draftEvent1Date.dateTime, 75),
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		rankingName: 'CUSTOM',
		isPublicVisible: true
	}
];

// ============================================================================
// RACE RESULT DATA (~100 results = 5 per race × 20 races)
// ============================================================================

export const seedRaceResults: RaceResultData[] = [
	// ========================================================================
	// EVENT 1 - FINISHED (ELITE races with times)
	// ========================================================================

	// Race 1: ELITE MALE LONG
	{
		eventId: 'e0000000-0000-0000-0000-000000000001',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'c0000000-0000-0000-0000-000000000001', // Carlos (linked)
		place: 1,
		time: '02:45:30',
		rankingName: 'UCI'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000001',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-0', // Alberto Fernández
		place: 2,
		time: '02:46:15',
		rankingName: 'UCI'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000001',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-1', // Diego Sánchez
		place: 3,
		time: '02:47:00',
		rankingName: 'UCI'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000001',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-2', // Pablo López
		place: 4,
		time: '02:48:20',
		rankingName: 'UCI'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000001',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-3', // Alejandro González
		place: 5,
		time: '02:50:10',
		rankingName: 'UCI'
	},

	// Race 2: ELITE MALE SHORT
	{
		eventId: 'e0000000-0000-0000-0000-000000000001',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-4', // Sergio Pérez
		place: 1,
		time: '01:15:20',
		rankingName: 'UCI'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000001',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-5', // Rubén Martín
		place: 2,
		time: '01:16:00',
		rankingName: 'UCI'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000001',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-6', // Iván Jiménez
		place: 3,
		time: '01:16:45',
		rankingName: 'UCI'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000001',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-7', // Adrián Ruiz
		place: 4,
		time: '01:17:30',
		rankingName: 'UCI'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000001',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-8', // David Hernández
		place: 5,
		time: '01:18:15',
		rankingName: 'UCI'
	},

	// Race 3: ELITE FEMALE LONG
	{
		eventId: 'e0000000-0000-0000-0000-000000000001',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'c0000000-0000-0000-0000-000000000002', // María (linked)
		place: 1,
		time: '03:10:45',
		rankingName: 'UCI'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000001',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-12', // Ana Torres
		place: 2,
		time: '03:12:30',
		rankingName: 'UCI'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000001',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-13', // Laura Ramírez
		place: 3,
		time: '03:15:00',
		rankingName: 'UCI'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000001',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-14', // Carmen Vargas
		place: 4,
		time: '03:17:20',
		rankingName: 'UCI'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000001',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-15', // Sofía Castro
		place: 5,
		time: '03:20:10',
		rankingName: 'UCI'
	},

	// Race 4: ELITE FEMALE SHORT
	{
		eventId: 'e0000000-0000-0000-0000-000000000001',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-16', // Marta Ortiz
		place: 1,
		time: '01:25:30',
		rankingName: 'UCI'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000001',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-17', // Elena Romero
		place: 2,
		time: '01:26:15',
		rankingName: 'UCI'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000001',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-18', // Paula Navarro
		place: 3,
		time: '01:27:00',
		rankingName: 'UCI'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000001',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-19', // Beatriz Iglesias
		place: 4,
		time: '01:27:45',
		rankingName: 'UCI'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000001',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-20', // Cristina Gil
		place: 5,
		time: '01:28:30',
		rankingName: 'UCI'
	},

	// ========================================================================
	// EVENT 2 - FINISHED (MA races with times)
	// ========================================================================

	// Race 1: MA MALE LONG
	{
		eventId: 'e0000000-0000-0000-0000-000000000002',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'c0000000-0000-0000-0000-000000000003', // Javier (linked)
		place: 1,
		time: '02:55:15',
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000002',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-24', // Antonio Ramos
		place: 2,
		time: '02:56:30',
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000002',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-25', // José Vega
		place: 3,
		time: '02:58:00',
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000002',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-26', // Manuel Méndez
		place: 4,
		time: '03:00:45',
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000002',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-27', // Francisco Cruz
		place: 5,
		time: '03:02:30',
		rankingName: 'NATIONAL'
	},

	// Race 2: MA MALE SHORT
	{
		eventId: 'e0000000-0000-0000-0000-000000000002',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-28', // Juan Reyes
		place: 1,
		time: '01:30:15',
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000002',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-29', // Pedro Flores
		place: 2,
		time: '01:31:00',
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000002',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-30', // Luis Herrera
		place: 3,
		time: '01:32:30',
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000002',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-31', // Ricardo Aguilar
		place: 4,
		time: '01:33:15',
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000002',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-32', // Rafael Cabrera
		place: 5,
		time: '01:34:00',
		rankingName: 'NATIONAL'
	},

	// Race 3: MA FEMALE LONG
	{
		eventId: 'e0000000-0000-0000-0000-000000000002',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-36', // Rosa Domínguez
		place: 1,
		time: '03:20:45',
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000002',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-37', // Pilar Blanco
		place: 2,
		time: '03:22:30',
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000002',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-38', // Teresa Suárez
		place: 3,
		time: '03:25:15',
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000002',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-39', // Mercedes Vidal
		place: 4,
		time: '03:28:00',
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000002',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-40', // Dolores Carrasco
		place: 5,
		time: '03:30:45',
		rankingName: 'NATIONAL'
	},

	// Race 4: MA FEMALE SHORT
	{
		eventId: 'e0000000-0000-0000-0000-000000000002',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-41', // Rocío León
		place: 1,
		time: '01:35:20',
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000002',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-42', // Nuria Mora
		place: 2,
		time: '01:36:15',
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000002',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-43', // Amparo Lozano
		place: 3,
		time: '01:37:00',
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000002',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-44', // Montserrat Cano
		place: 4,
		time: '01:38:30',
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000002',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-36', // Rosa Domínguez (participates again in different length)
		place: 5,
		time: '01:39:15',
		rankingName: 'NATIONAL'
	},

	// ========================================================================
	// EVENT 3 - FINISHED (Mixed ELITE and MA with times)
	// ========================================================================

	// Race 1: ELITE MALE LONG
	{
		eventId: 'e0000000-0000-0000-0000-000000000003',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-9', // Miguel Díaz
		place: 1,
		time: '02:48:10',
		rankingName: 'REGIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000003',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'c0000000-0000-0000-0000-000000000001', // Carlos (different event, same category)
		place: 2,
		time: '02:49:30',
		rankingName: 'REGIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000003',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-10', // Raúl Moreno
		place: 3,
		time: '02:50:45',
		rankingName: 'REGIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000003',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-11', // Fernando Muñoz
		place: 4,
		time: '02:52:00',
		rankingName: 'REGIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000003',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-0', // Alberto Fernández (different event)
		place: 5,
		time: '02:53:20',
		rankingName: 'REGIONAL'
	},

	// Race 2: ELITE FEMALE SHORT
	{
		eventId: 'e0000000-0000-0000-0000-000000000003',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-21', // Isabel Santos
		place: 1,
		time: '01:28:15',
		rankingName: 'REGIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000003',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'c0000000-0000-0000-0000-000000000002', // María (different event)
		place: 2,
		time: '01:29:00',
		rankingName: 'REGIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000003',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-22', // Lucía Serrano
		place: 3,
		time: '01:29:45',
		rankingName: 'REGIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000003',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-23', // Silvia Molina
		place: 4,
		time: '01:30:30',
		rankingName: 'REGIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000003',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-12', // Ana Torres (different event, different length)
		place: 5,
		time: '01:31:15',
		rankingName: 'REGIONAL'
	},

	// Race 3: MA MALE LONG
	{
		eventId: 'e0000000-0000-0000-0000-000000000003',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-33', // Ángel Prieto
		place: 1,
		time: '03:01:30',
		rankingName: 'REGIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000003',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'c0000000-0000-0000-0000-000000000003', // Javier (different event, same category)
		place: 2,
		time: '03:02:45',
		rankingName: 'REGIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000003',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-34', // Víctor Cortés
		place: 3,
		time: '03:04:15',
		rankingName: 'REGIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000003',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-35', // Enrique Campos
		place: 4,
		time: '03:06:00',
		rankingName: 'REGIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000003',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-24', // Antonio Ramos (different event, different length)
		place: 5,
		time: '03:07:30',
		rankingName: 'REGIONAL'
	},

	// Race 4: MA FEMALE SHORT
	{
		eventId: 'e0000000-0000-0000-0000-000000000003',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-37', // Pilar Blanco (different event, different length)
		place: 1,
		time: '01:38:45',
		rankingName: 'REGIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000003',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-38', // Teresa Suárez (different event, different length)
		place: 2,
		time: '01:39:30',
		rankingName: 'REGIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000003',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-39', // Mercedes Vidal (different event, different length)
		place: 3,
		time: '01:40:15',
		rankingName: 'REGIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000003',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-40', // Dolores Carrasco (different event, different length)
		place: 4,
		time: '01:41:00',
		rankingName: 'REGIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000003',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-41', // Rocío León (different event, different length)
		place: 5,
		time: '01:42:30',
		rankingName: 'REGIONAL'
	},

	// ========================================================================
	// EVENT 4 - FUTURE (AVAILABLE) - No times yet
	// ========================================================================

	// Race 1: ELITE MALE LONG
	{
		eventId: 'e0000000-0000-0000-0000-000000000004',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-1', // Diego Sánchez (different event, same length)
		place: 1,
		time: null,
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000004',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-2', // Pablo López (different event, same length)
		place: 2,
		time: null,
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000004',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-3', // Alejandro González (different event, same length)
		place: 3,
		time: null,
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000004',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'c0000000-0000-0000-0000-000000000001', // Carlos (third event, switches to LONG)
		place: 4,
		time: null,
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000004',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-4', // Sergio Pérez (different event, switches to LONG)
		place: 5,
		time: null,
		rankingName: 'NATIONAL'
	},

	// Race 2: ELITE FEMALE LONG
	{
		eventId: 'e0000000-0000-0000-0000-000000000004',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-13', // Laura Ramírez (different event, same length)
		place: 1,
		time: null,
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000004',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-14', // Carmen Vargas (different event, same length)
		place: 2,
		time: null,
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000004',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-15', // Sofía Castro (different event, same length)
		place: 3,
		time: null,
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000004',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'c0000000-0000-0000-0000-000000000002', // María (third event)
		place: 4,
		time: null,
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000004',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-16', // Marta Ortiz (different event, switches to LONG)
		place: 5,
		time: null,
		rankingName: 'NATIONAL'
	},

	// Race 3: MA MALE SHORT
	{
		eventId: 'e0000000-0000-0000-0000-000000000004',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-25', // José Vega (different event, switches to SHORT)
		place: 1,
		time: null,
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000004',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-26', // Manuel Méndez (different event, switches to SHORT)
		place: 2,
		time: null,
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000004',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-27', // Francisco Cruz (different event, switches to SHORT)
		place: 3,
		time: null,
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000004',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'c0000000-0000-0000-0000-000000000003', // Javier (third event, switches to SHORT)
		place: 4,
		time: null,
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000004',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-28', // Juan Reyes (different event, same length)
		place: 5,
		time: null,
		rankingName: 'NATIONAL'
	},

	// Race 4: MA FEMALE SHORT
	{
		eventId: 'e0000000-0000-0000-0000-000000000004',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-42', // Nuria Mora (different event, same length)
		place: 1,
		time: null,
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000004',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-43', // Amparo Lozano (different event, same length)
		place: 2,
		time: null,
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000004',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-44', // Montserrat Cano (different event, same length)
		place: 3,
		time: null,
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000004',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-36', // Rosa Domínguez (third event, switches to SHORT)
		place: 4,
		time: null,
		rankingName: 'NATIONAL'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000004',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-41', // Rocío León (third event)
		place: 5,
		time: null,
		rankingName: 'NATIONAL'
	},

	// ========================================================================
	// EVENT 5 - DRAFT (DRAFT) - Minimal results, no times
	// ========================================================================

	// Race 1: ELITE MALE SHORT
	{
		eventId: 'e0000000-0000-0000-0000-000000000005',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-5', // Rubén Martín (different event, same length)
		place: 1,
		time: null,
		rankingName: 'CUSTOM'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000005',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-6', // Iván Jiménez (different event, same length)
		place: 2,
		time: null,
		rankingName: 'CUSTOM'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000005',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-7', // Adrián Ruiz (different event, same length)
		place: 3,
		time: null,
		rankingName: 'CUSTOM'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000005',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-8', // David Hernández (different event, same length)
		place: 4,
		time: null,
		rankingName: 'CUSTOM'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000005',
		categoryName: 'ELITE',
		genderName: 'MALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-9', // Miguel Díaz (different event, switches to SHORT)
		place: 5,
		time: null,
		rankingName: 'CUSTOM'
	},

	// Race 2: ELITE FEMALE LONG
	{
		eventId: 'e0000000-0000-0000-0000-000000000005',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-17', // Elena Romero (different event, switches to LONG)
		place: 1,
		time: null,
		rankingName: 'CUSTOM'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000005',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-18', // Paula Navarro (different event, switches to LONG)
		place: 2,
		time: null,
		rankingName: 'CUSTOM'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000005',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-19', // Beatriz Iglesias (different event, switches to LONG)
		place: 3,
		time: null,
		rankingName: 'CUSTOM'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000005',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-20', // Cristina Gil (different event, switches to LONG)
		place: 4,
		time: null,
		rankingName: 'CUSTOM'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000005',
		categoryName: 'ELITE',
		genderName: 'FEMALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-21', // Isabel Santos (different event, switches to LONG)
		place: 5,
		time: null,
		rankingName: 'CUSTOM'
	},

	// Race 3: MA MALE LONG
	{
		eventId: 'e0000000-0000-0000-0000-000000000005',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-29', // Pedro Flores (different event, switches to LONG)
		place: 1,
		time: null,
		rankingName: 'CUSTOM'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000005',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-30', // Luis Herrera (different event, switches to LONG)
		place: 2,
		time: null,
		rankingName: 'CUSTOM'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000005',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-31', // Ricardo Aguilar (different event, switches to LONG)
		place: 3,
		time: null,
		rankingName: 'CUSTOM'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000005',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-32', // Rafael Cabrera (different event, switches to LONG)
		place: 4,
		time: null,
		rankingName: 'CUSTOM'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000005',
		categoryName: 'MA',
		genderName: 'MALE',
		lengthName: 'LONG',
		cyclistIdentifier: 'anon-33', // Ángel Prieto (different event, same length)
		place: 5,
		time: null,
		rankingName: 'CUSTOM'
	},

	// Race 4: MA FEMALE SHORT
	{
		eventId: 'e0000000-0000-0000-0000-000000000005',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-37', // Pilar Blanco (third event)
		place: 1,
		time: null,
		rankingName: 'CUSTOM'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000005',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-38', // Teresa Suárez (third event)
		place: 2,
		time: null,
		rankingName: 'CUSTOM'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000005',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-39', // Mercedes Vidal (third event)
		place: 3,
		time: null,
		rankingName: 'CUSTOM'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000005',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-40', // Dolores Carrasco (third event)
		place: 4,
		time: null,
		rankingName: 'CUSTOM'
	},
	{
		eventId: 'e0000000-0000-0000-0000-000000000005',
		categoryName: 'MA',
		genderName: 'FEMALE',
		lengthName: 'SHORT',
		cyclistIdentifier: 'anon-42', // Nuria Mora (different event, same length)
		place: 5,
		time: null,
		rankingName: 'CUSTOM'
	}
];

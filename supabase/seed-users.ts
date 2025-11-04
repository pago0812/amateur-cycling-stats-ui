#!/usr/bin/env tsx

/**
 * Supabase User Seeding Script
 *
 * Creates test users using Supabase Admin API for reliable authentication.
 * This script handles all auth.users fields automatically, preventing NULL token errors.
 *
 * IMPORTANT: Run this AFTER database migrations and seed.sql
 *
 * Usage:
 *   npx tsx supabase/seed-users.ts
 *
 * Test Users Created:
 *   - admin@acs.com / #admin123 (Admin)
 *   - organizer@example.com / password123 (Organizer Admin)
 *   - staff@example.com / password123 (Organizer Staff)
 *   - cyclist1@example.com / password123 (Cyclist)
 *   - cyclist2@example.com / password123 (Cyclist)
 *   - cyclist3@example.com / password123 (Cyclist)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env file
function loadEnvFile(): void {
	try {
		const envPath = resolve(process.cwd(), '.env');
		const envContent = readFileSync(envPath, 'utf-8');

		envContent.split('\n').forEach((line) => {
			const trimmedLine = line.trim();
			if (trimmedLine && !trimmedLine.startsWith('#')) {
				const [key, ...valueParts] = trimmedLine.split('=');
				const value = valueParts.join('=').trim();
				if (key && value) {
					process.env[key.trim()] = value;
				}
			}
		});
	} catch (error) {
		console.error('⚠️  Warning: Could not load .env file');
	}
}

// Load .env file
loadEnvFile();

// Get environment variables
const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
	console.error('❌ Missing required environment variables:');
	console.error('   - PUBLIC_SUPABASE_URL');
	console.error('   - SUPABASE_SERVICE_ROLE_KEY');
	console.error('\nMake sure your .env file is configured correctly.');
	process.exit(1);
}

// Create Supabase admin client (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
	auth: {
		autoRefreshToken: false,
		persistSession: false
	}
});

// User definitions
interface TestUser {
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

const TEST_USERS: TestUser[] = [
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

/**
 * Get role ID by role name
 */
async function getRoleId(roleName: string): Promise<string> {
	const { data, error } = await supabase.from('roles').select('id').eq('name', roleName).single();

	if (error || !data) {
		throw new Error(`Failed to find role: ${roleName}. Error: ${error?.message}`);
	}

	return data.id;
}

/**
 * Get organization ID by organization name
 */
async function getOrganizationId(organizationName: string): Promise<string> {
	const { data, error } = await supabase
		.from('organizations')
		.select('id')
		.eq('name', organizationName)
		.single();

	if (error || !data) {
		throw new Error(`Failed to find organization: ${organizationName}. Error: ${error?.message}`);
	}

	return data.id;
}

/**
 * Get cyclist gender ID by gender name
 */
async function getCyclistGenderId(gender: 'M' | 'F'): Promise<string> {
	const { data, error } = await supabase
		.from('cyclist_genders')
		.select('id')
		.eq('name', gender)
		.single();

	if (error || !data) {
		throw new Error(`Failed to find cyclist gender: ${gender}. Error: ${error?.message}`);
	}

	return data.id;
}

/**
 * Create a test user with Supabase Admin API
 */
async function createTestUser(user: TestUser): Promise<void> {
	console.log(`\n📝 Creating user: ${user.email} (${user.roleName})`);

	// Step 1: Create auth.users entry using Admin API
	// This automatically handles all required fields including tokens
	const { data: authData, error: authError } = await supabase.auth.admin.createUser({
		id: user.id,
		email: user.email,
		password: user.password,
		email_confirm: true, // Skip email verification
		user_metadata: {
			username: user.username
		}
	});

	if (authError) {
		// Check if user already exists
		if (authError.message.includes('already') || authError.message.includes('duplicate')) {
			console.log(`   ⏭️  User already exists, skipping...`);
			return;
		}
		throw new Error(`Failed to create auth user: ${authError.message}`);
	}

	console.log(`   ✅ Auth user created: ${authData.user.id}`);

	// Step 2: Get role ID
	const roleId = await getRoleId(user.roleName);
	console.log(`   ✅ Role found: ${user.roleName} (${roleId})`);

	// Step 3: Create or update public.users entry
	// Note: The trigger might auto-create this with cyclist role, so we upsert
	const { error: userError } = await supabase.from('users').upsert(
		{
			id: user.id,
			username: user.username,
			role_id: roleId
		},
		{
			onConflict: 'id'
		}
	);

	if (userError) {
		throw new Error(`Failed to create/update public.users: ${userError.message}`);
	}

	console.log(`   ✅ Public user profile created/updated`);

	// Step 4: Handle cyclist-specific data
	if (user.cyclistData) {
		const genderId = await getCyclistGenderId(user.cyclistData.gender);

		// Update the auto-created cyclist profile
		const { error: cyclistError } = await supabase
			.from('cyclists')
			.update({
				name: user.cyclistData.name,
				last_name: user.cyclistData.lastName,
				born_year: user.cyclistData.bornYear,
				gender_id: genderId
			})
			.eq('user_id', user.id);

		if (cyclistError) {
			throw new Error(`Failed to update cyclist profile: ${cyclistError.message}`);
		}

		console.log(
			`   ✅ Cyclist profile updated: ${user.cyclistData.name} ${user.cyclistData.lastName}`
		);
	}

	// Step 5: Handle organizer-specific data
	if (user.organizerData) {
		const organizationId = await getOrganizationId(user.organizerData.organizationName);

		// Create organizer profile
		const { error: organizerError } = await supabase.from('organizers').upsert(
			{
				user_id: user.id,
				organization_id: organizationId
			},
			{
				onConflict: 'user_id,organization_id'
			}
		);

		if (organizerError) {
			throw new Error(`Failed to create organizer profile: ${organizerError.message}`);
		}

		console.log(`   ✅ Organizer profile created for: ${user.organizerData.organizationName}`);
	}

	console.log(`   🎉 User ${user.email} created successfully!`);
}

/**
 * Get cyclist ID by user ID
 */
async function getCyclistIdByUserId(userId: string): Promise<string> {
	const { data, error } = await supabase.from('cyclists').select('id').eq('user_id', userId).single();

	if (error || !data) {
		throw new Error(`Failed to find cyclist for user: ${userId}. Error: ${error?.message}`);
	}

	return data.id;
}

/**
 * Get race category ID by name
 */
async function getRaceCategoryId(categoryName: string): Promise<string> {
	const { data, error } = await supabase
		.from('race_categories')
		.select('id')
		.eq('name', categoryName)
		.single();

	if (error || !data) {
		throw new Error(`Failed to find race category: ${categoryName}. Error: ${error?.message}`);
	}

	return data.id;
}

/**
 * Get race category gender ID by name
 */
async function getRaceCategoryGenderId(genderName: string): Promise<string> {
	const { data, error } = await supabase
		.from('race_category_genders')
		.select('id')
		.eq('name', genderName)
		.single();

	if (error || !data) {
		throw new Error(
			`Failed to find race category gender: ${genderName}. Error: ${error?.message}`
		);
	}

	return data.id;
}

/**
 * Get race category length ID by name
 */
async function getRaceCategoryLengthId(lengthName: string): Promise<string> {
	const { data, error } = await supabase
		.from('race_category_lengths')
		.select('id')
		.eq('name', lengthName)
		.single();

	if (error || !data) {
		throw new Error(
			`Failed to find race category length: ${lengthName}. Error: ${error?.message}`
		);
	}

	return data.id;
}

/**
 * Get race ranking ID by name
 */
async function getRaceRankingId(rankingName: string): Promise<string> {
	const { data, error } = await supabase
		.from('race_rankings')
		.select('id')
		.eq('name', rankingName)
		.single();

	if (error || !data) {
		throw new Error(`Failed to find race ranking: ${rankingName}. Error: ${error?.message}`);
	}

	return data.id;
}

/**
 * Get ranking point ID by ranking and place
 */
async function getRankingPointId(rankingId: string, place: number): Promise<string> {
	const { data, error } = await supabase
		.from('ranking_points')
		.select('id')
		.eq('race_ranking_id', rankingId)
		.eq('place', place)
		.single();

	if (error || !data) {
		throw new Error(
			`Failed to find ranking point for ranking ${rankingId} place ${place}. Error: ${error?.message}`
		);
	}

	return data.id;
}

/**
 * Get unlinked cyclist IDs (cyclists without user accounts)
 */
async function getUnlinkedCyclistIds(): Promise<string[]> {
	const { data, error } = await supabase
		.from('cyclists')
		.select('id')
		.is('user_id', null)
		.order('created_at', { ascending: true });

	if (error) {
		throw new Error(`Failed to get unlinked cyclists. Error: ${error.message}`);
	}

	return (data || []).map((c) => c.id);
}

/**
 * Seed events (requires users to exist for created_by field)
 */
async function seedEvents(): Promise<{
	event1: string;
	event2: string;
	event3: string;
	event4: string;
}> {
	console.log('\n\n📅 Creating events...');

	// Get user IDs
	const userOrganizerId = 'b0000000-0000-0000-0000-000000000001';
	const userStaffId = 'b0000000-0000-0000-0000-000000000002';

	// Get organization IDs
	const orgProLeagueId = await getOrganizationId('Pro Cycling League Spain');
	const orgValenciaFedId = await getOrganizationId('Valencia Cycling Federation');

	// Get category IDs
	const catEliteId = await getRaceCategoryId('ELITE');
	const catMaId = await getRaceCategoryId('MA');
	const catMbId = await getRaceCategoryId('MB');
	const catEs1923Id = await getRaceCategoryId('ES_19_23');
	const catJa1516Id = await getRaceCategoryId('JA_15_16');

	// Get gender IDs
	const genderMaleId = await getRaceCategoryGenderId('MALE');
	const genderFemaleId = await getRaceCategoryGenderId('FEMALE');
	const genderOpenId = await getRaceCategoryGenderId('OPEN');

	// Get length IDs
	const lengthLongId = await getRaceCategoryLengthId('LONG');
	const lengthShortId = await getRaceCategoryLengthId('SHORT');

	// Event 1: Past Public Event (FINISHED)
	const { data: event1, error: event1Error } = await supabase
		.from('events')
		.insert({
			name: 'Gran Fondo Madrid 2024',
			city: 'Madrid',
			country: 'España',
			state: 'Madrid',
			date_time: '2024-06-15 09:00:00',
			year: 2024,
			event_status: 'FINISHED',
			is_public_visible: true,
			created_by: userOrganizerId,
			organization_id: orgProLeagueId
		})
		.select('id')
		.single();

	if (event1Error) throw new Error(`Failed to create event 1: ${event1Error.message}`);
	console.log(`   ✅ Event 1 created: Gran Fondo Madrid 2024`);

	// Event 2: Future Public Event (AVAILABLE)
	const { data: event2, error: event2Error } = await supabase
		.from('events')
		.insert({
			name: 'Tour de Valencia Amateur 2025',
			city: 'Valencia',
			country: 'España',
			state: 'Valencia',
			date_time: '2025-09-20 08:00:00',
			year: 2025,
			event_status: 'AVAILABLE',
			is_public_visible: true,
			created_by: userStaffId,
			organization_id: orgValenciaFedId
		})
		.select('id')
		.single();

	if (event2Error) throw new Error(`Failed to create event 2: ${event2Error.message}`);
	console.log(`   ✅ Event 2 created: Tour de Valencia Amateur 2025`);

	// Event 3: Future Private Event (DRAFT)
	const { data: event3, error: event3Error } = await supabase
		.from('events')
		.insert({
			name: 'Test Event 2025',
			city: 'Barcelona',
			country: 'España',
			state: 'Cataluña',
			date_time: '2025-12-01 10:00:00',
			year: 2025,
			event_status: 'DRAFT',
			is_public_visible: false,
			created_by: userOrganizerId,
			organization_id: orgProLeagueId
		})
		.select('id')
		.single();

	if (event3Error) throw new Error(`Failed to create event 3: ${event3Error.message}`);
	console.log(`   ✅ Event 3 created: Test Event 2025`);

	// Event 4: Current Event (ON_GOING)
	const { data: event4, error: event4Error } = await supabase
		.from('events')
		.insert({
			name: 'Campeonato Regional Andalucía 2025',
			city: 'Sevilla',
			country: 'España',
			state: 'Andalucía',
			date_time: '2025-03-15 09:30:00',
			year: 2025,
			event_status: 'ON_GOING',
			is_public_visible: true,
			created_by: userOrganizerId,
			organization_id: orgProLeagueId
		})
		.select('id')
		.single();

	if (event4Error) throw new Error(`Failed to create event 4: ${event4Error.message}`);
	console.log(`   ✅ Event 4 created: Campeonato Regional Andalucía 2025`);

	const eventIds = [event1.id, event2.id, event3.id, event4.id];
	const categoryIds = [catEliteId, catMaId, catMbId, catEs1923Id, catJa1516Id];
	const genderIds = [genderMaleId, genderFemaleId, genderOpenId];
	const lengthIds = [lengthLongId, lengthShortId];

	// Create event supported configurations
	console.log(`\n   📋 Creating event supported configurations...`);

	for (const eventId of eventIds) {
		// Supported categories
		const categoriesData = categoryIds.map((catId) => ({
			event_id: eventId,
			race_category_id: catId
		}));
		const { error: catError } = await supabase
			.from('event_supported_categories')
			.insert(categoriesData);
		if (catError) throw new Error(`Failed to create supported categories: ${catError.message}`);

		// Supported genders
		const gendersData = genderIds.map((genderId) => ({
			event_id: eventId,
			race_category_gender_id: genderId
		}));
		const { error: genderError } = await supabase
			.from('event_supported_genders')
			.insert(gendersData);
		if (genderError) throw new Error(`Failed to create supported genders: ${genderError.message}`);

		// Supported lengths
		const lengthsData = lengthIds.map((lengthId) => ({
			event_id: eventId,
			race_category_length_id: lengthId
		}));
		const { error: lengthError } = await supabase
			.from('event_supported_lengths')
			.insert(lengthsData);
		if (lengthError) throw new Error(`Failed to create supported lengths: ${lengthError.message}`);
	}

	console.log(`   ✅ Event supported configurations created`);

	// Store event IDs for race seeding
	return { event1: event1.id, event2: event2.id, event3: event3.id, event4: event4.id };
}

/**
 * Seed races (requires events to exist)
 */
async function seedRaces(eventIds: {
	event1: string;
	event2: string;
	event3: string;
	event4: string;
}): Promise<void> {
	console.log('\n\n🏁 Creating races...');

	// Get category IDs
	const catEliteId = await getRaceCategoryId('ELITE');
	const catMaId = await getRaceCategoryId('MA');
	const catMbId = await getRaceCategoryId('MB');
	const catEs1923Id = await getRaceCategoryId('ES_19_23');
	const catJa1516Id = await getRaceCategoryId('JA_15_16');

	// Get gender IDs
	const genderMaleId = await getRaceCategoryGenderId('MALE');
	const genderFemaleId = await getRaceCategoryGenderId('FEMALE');
	const genderOpenId = await getRaceCategoryGenderId('OPEN');

	// Get length IDs
	const lengthLongId = await getRaceCategoryLengthId('LONG');
	const lengthShortId = await getRaceCategoryLengthId('SHORT');

	// Get ranking IDs
	const rankingUciId = await getRaceRankingId('UCI');
	const rankingNationalId = await getRaceRankingId('NATIONAL');
	const rankingRegionalId = await getRaceRankingId('REGIONAL');
	const rankingCustomId = await getRaceRankingId('CUSTOM');

	// Event 1 Races (Past Event - all public, finished)
	await supabase.from('races').insert([
		{
			event_id: eventIds.event1,
			date_time: '2024-06-15 09:00:00',
			race_category_id: catEliteId,
			race_category_gender_id: genderMaleId,
			race_category_length_id: lengthLongId,
			race_ranking_id: rankingUciId,
			is_public_visible: true
		},
		{
			event_id: eventIds.event1,
			date_time: '2024-06-15 09:15:00',
			race_category_id: catEliteId,
			race_category_gender_id: genderFemaleId,
			race_category_length_id: lengthLongId,
			race_ranking_id: rankingUciId,
			is_public_visible: true
		},
		{
			event_id: eventIds.event1,
			date_time: '2024-06-15 10:00:00',
			race_category_id: catMaId,
			race_category_gender_id: genderMaleId,
			race_category_length_id: lengthShortId,
			race_ranking_id: rankingNationalId,
			is_public_visible: true
		}
	]);
	console.log(`   ✅ Event 1 races created (3 races)`);

	// Event 2 Races (Future Event - all public)
	await supabase.from('races').insert([
		{
			event_id: eventIds.event2,
			date_time: '2025-09-20 08:00:00',
			race_category_id: catEliteId,
			race_category_gender_id: genderMaleId,
			race_category_length_id: lengthLongId,
			race_ranking_id: rankingNationalId,
			is_public_visible: true
		},
		{
			event_id: eventIds.event2,
			date_time: '2025-09-20 08:15:00',
			race_category_id: catEs1923Id,
			race_category_gender_id: genderOpenId,
			race_category_length_id: lengthShortId,
			race_ranking_id: rankingRegionalId,
			is_public_visible: true
		},
		{
			event_id: eventIds.event2,
			date_time: '2025-09-20 09:00:00',
			race_category_id: catMbId,
			race_category_gender_id: genderMaleId,
			race_category_length_id: lengthLongId,
			race_ranking_id: rankingRegionalId,
			is_public_visible: true
		}
	]);
	console.log(`   ✅ Event 2 races created (3 races)`);

	// Event 3 Races (Draft Event - mixed visibility)
	await supabase.from('races').insert([
		{
			event_id: eventIds.event3,
			date_time: '2025-12-01 10:00:00',
			race_category_id: catEliteId,
			race_category_gender_id: genderMaleId,
			race_category_length_id: lengthLongId,
			race_ranking_id: rankingCustomId,
			is_public_visible: false
		},
		{
			event_id: eventIds.event3,
			date_time: '2025-12-01 10:30:00',
			race_category_id: catJa1516Id,
			race_category_gender_id: genderOpenId,
			race_category_length_id: lengthShortId,
			race_ranking_id: rankingCustomId,
			is_public_visible: false
		},
		{
			event_id: eventIds.event3,
			date_time: '2025-12-01 11:00:00',
			race_category_id: catMaId,
			race_category_gender_id: genderFemaleId,
			race_category_length_id: lengthShortId,
			race_ranking_id: rankingCustomId,
			is_public_visible: true
		}
	]);
	console.log(`   ✅ Event 3 races created (3 races)`);

	// Event 4 Races (Ongoing Event - all public)
	await supabase.from('races').insert([
		{
			event_id: eventIds.event4,
			date_time: '2025-03-15 09:30:00',
			race_category_id: catEliteId,
			race_category_gender_id: genderMaleId,
			race_category_length_id: lengthLongId,
			race_ranking_id: rankingUciId,
			is_public_visible: true
		},
		{
			event_id: eventIds.event4,
			date_time: '2025-03-15 09:45:00',
			race_category_id: catEliteId,
			race_category_gender_id: genderFemaleId,
			race_category_length_id: lengthLongId,
			race_ranking_id: rankingUciId,
			is_public_visible: true
		},
		{
			event_id: eventIds.event4,
			date_time: '2025-03-15 11:00:00',
			race_category_id: catMbId,
			race_category_gender_id: genderMaleId,
			race_category_length_id: lengthShortId,
			race_ranking_id: rankingNationalId,
			is_public_visible: true
		}
	]);
	console.log(`   ✅ Event 4 races created (3 races)`);

	console.log(`\n   🎉 Total: 12 races created`);
}

/**
 * Seed race results (requires races and cyclists to exist)
 */
async function seedRaceResults(eventIds: {
	event1: string;
	event2: string;
	event3: string;
	event4: string;
}): Promise<void> {
	console.log('\n\n🏆 Creating race results...');

	// Get linked cyclist IDs
	const cyclistLinked1Id = await getCyclistIdByUserId('c0000000-0000-0000-0000-000000000001');
	const cyclistLinked2Id = await getCyclistIdByUserId('c0000000-0000-0000-0000-000000000002');
	const cyclistLinked3Id = await getCyclistIdByUserId('c0000000-0000-0000-0000-000000000003');

	// Get unlinked cyclist IDs (5 cyclists created in seed.sql)
	const unlinkedIds = await getUnlinkedCyclistIds();
	if (unlinkedIds.length < 5) {
		throw new Error('Expected at least 5 unlinked cyclists from seed.sql');
	}
	const [
		cyclistUnlinked1Id,
		cyclistUnlinked2Id,
		cyclistUnlinked3Id,
		cyclistUnlinked4Id,
		cyclistUnlinked5Id
	] = unlinkedIds;

	// Get ranking IDs
	const rankingUciId = await getRaceRankingId('UCI');
	const rankingNationalId = await getRaceRankingId('NATIONAL');
	const rankingRegionalId = await getRaceRankingId('REGIONAL');
	const rankingCustomId = await getRaceRankingId('CUSTOM');

	// Get category IDs for querying races
	const catEliteId = await getRaceCategoryId('ELITE');
	const catMaId = await getRaceCategoryId('MA');
	const catMbId = await getRaceCategoryId('MB');
	const catEs1923Id = await getRaceCategoryId('ES_19_23');
	const catJa1516Id = await getRaceCategoryId('JA_15_16');

	// Get gender IDs for querying races
	const genderMaleId = await getRaceCategoryGenderId('MALE');
	const genderFemaleId = await getRaceCategoryGenderId('FEMALE');
	const genderOpenId = await getRaceCategoryGenderId('OPEN');

	// Helper: Get race ID
	async function getRaceId(
		eventId: string,
		categoryId: string,
		genderId: string
	): Promise<string> {
		const { data, error } = await supabase
			.from('races')
			.select('id')
			.eq('event_id', eventId)
			.eq('race_category_id', categoryId)
			.eq('race_category_gender_id', genderId)
			.single();

		if (error || !data) {
			throw new Error(`Failed to find race. Error: ${error?.message}`);
		}

		return data.id;
	}

	// Event 1 - Race 1 (Elite Male Long UCI)
	const race1_1Id = await getRaceId(eventIds.event1, catEliteId, genderMaleId);
	await supabase.from('race_results').insert([
		{
			race_id: race1_1Id,
			cyclist_id: cyclistLinked1Id,
			place: 1,
			time: '02:45:30',
			ranking_point_id: await getRankingPointId(rankingUciId, 1)
		},
		{
			race_id: race1_1Id,
			cyclist_id: cyclistUnlinked5Id,
			place: 2,
			time: '02:46:15',
			ranking_point_id: await getRankingPointId(rankingUciId, 2)
		},
		{
			race_id: race1_1Id,
			cyclist_id: cyclistLinked3Id,
			place: 3,
			time: '02:47:00',
			ranking_point_id: await getRankingPointId(rankingUciId, 3)
		},
		{
			race_id: race1_1Id,
			cyclist_id: cyclistUnlinked1Id,
			place: 4,
			time: '02:48:20',
			ranking_point_id: await getRankingPointId(rankingUciId, 4)
		},
		{
			race_id: race1_1Id,
			cyclist_id: cyclistUnlinked3Id,
			place: 5,
			time: '02:50:10',
			ranking_point_id: await getRankingPointId(rankingUciId, 5)
		}
	]);

	// Event 1 - Race 2 (Elite Female Long UCI)
	const race1_2Id = await getRaceId(eventIds.event1, catEliteId, genderFemaleId);
	await supabase.from('race_results').insert([
		{
			race_id: race1_2Id,
			cyclist_id: cyclistLinked2Id,
			place: 1,
			time: '03:10:45',
			ranking_point_id: await getRankingPointId(rankingUciId, 1)
		},
		{
			race_id: race1_2Id,
			cyclist_id: cyclistUnlinked2Id,
			place: 2,
			time: '03:12:30',
			ranking_point_id: await getRankingPointId(rankingUciId, 2)
		},
		{
			race_id: race1_2Id,
			cyclist_id: cyclistUnlinked4Id,
			place: 3,
			time: '03:15:00',
			ranking_point_id: await getRankingPointId(rankingUciId, 3)
		}
	]);

	// Event 1 - Race 3 (MA Male Short National)
	const race1_3Id = await getRaceId(eventIds.event1, catMaId, genderMaleId);
	await supabase.from('race_results').insert([
		{
			race_id: race1_3Id,
			cyclist_id: cyclistUnlinked5Id,
			place: 1,
			time: '01:30:15',
			ranking_point_id: await getRankingPointId(rankingNationalId, 1)
		},
		{
			race_id: race1_3Id,
			cyclist_id: cyclistLinked3Id,
			place: 2,
			time: '01:31:00',
			ranking_point_id: await getRankingPointId(rankingNationalId, 2)
		},
		{
			race_id: race1_3Id,
			cyclist_id: cyclistUnlinked1Id,
			place: 3,
			time: '01:32:45',
			ranking_point_id: await getRankingPointId(rankingNationalId, 3)
		},
		{
			race_id: race1_3Id,
			cyclist_id: cyclistLinked1Id,
			place: 4,
			time: '01:35:00',
			ranking_point_id: await getRankingPointId(rankingNationalId, 4)
		},
		{
			race_id: race1_3Id,
			cyclist_id: cyclistUnlinked3Id,
			place: 5,
			time: '01:36:30',
			ranking_point_id: await getRankingPointId(rankingNationalId, 5)
		}
	]);

	console.log(`   ✅ Event 1 results created (13 results)`);

	// Event 2 - Race 1 (Elite Male Long National)
	const race2_1Id = await getRaceId(eventIds.event2, catEliteId, genderMaleId);
	await supabase.from('race_results').insert([
		{
			race_id: race2_1Id,
			cyclist_id: cyclistLinked1Id,
			place: 1,
			time: null,
			ranking_point_id: await getRankingPointId(rankingNationalId, 1)
		},
		{
			race_id: race2_1Id,
			cyclist_id: cyclistLinked3Id,
			place: 2,
			time: null,
			ranking_point_id: await getRankingPointId(rankingNationalId, 2)
		},
		{
			race_id: race2_1Id,
			cyclist_id: cyclistUnlinked5Id,
			place: 3,
			time: null,
			ranking_point_id: await getRankingPointId(rankingNationalId, 3)
		},
		{
			race_id: race2_1Id,
			cyclist_id: cyclistUnlinked1Id,
			place: 4,
			time: null,
			ranking_point_id: await getRankingPointId(rankingNationalId, 4)
		},
		{
			race_id: race2_1Id,
			cyclist_id: cyclistUnlinked3Id,
			place: 5,
			time: null,
			ranking_point_id: await getRankingPointId(rankingNationalId, 5)
		}
	]);

	// Event 2 - Race 2 (ES_19_23 Open Short Regional)
	const race2_2Id = await getRaceId(eventIds.event2, catEs1923Id, genderOpenId);
	await supabase.from('race_results').insert([
		{
			race_id: race2_2Id,
			cyclist_id: cyclistUnlinked3Id,
			place: 1,
			time: null,
			ranking_point_id: await getRankingPointId(rankingRegionalId, 1)
		},
		{
			race_id: race2_2Id,
			cyclist_id: cyclistUnlinked4Id,
			place: 2,
			time: null,
			ranking_point_id: await getRankingPointId(rankingRegionalId, 2)
		},
		{
			race_id: race2_2Id,
			cyclist_id: cyclistLinked1Id,
			place: 3,
			time: null,
			ranking_point_id: await getRankingPointId(rankingRegionalId, 3)
		},
		{
			race_id: race2_2Id,
			cyclist_id: cyclistLinked2Id,
			place: 4,
			time: null,
			ranking_point_id: await getRankingPointId(rankingRegionalId, 4)
		},
		{
			race_id: race2_2Id,
			cyclist_id: cyclistUnlinked2Id,
			place: 5,
			time: null,
			ranking_point_id: await getRankingPointId(rankingRegionalId, 5)
		}
	]);

	// Event 2 - Race 3 (MB Male Long Regional)
	const race2_3Id = await getRaceId(eventIds.event2, catMbId, genderMaleId);
	await supabase.from('race_results').insert([
		{
			race_id: race2_3Id,
			cyclist_id: cyclistUnlinked5Id,
			place: 1,
			time: null,
			ranking_point_id: await getRankingPointId(rankingRegionalId, 1)
		},
		{
			race_id: race2_3Id,
			cyclist_id: cyclistLinked3Id,
			place: 2,
			time: null,
			ranking_point_id: await getRankingPointId(rankingRegionalId, 2)
		},
		{
			race_id: race2_3Id,
			cyclist_id: cyclistUnlinked1Id,
			place: 3,
			time: null,
			ranking_point_id: await getRankingPointId(rankingRegionalId, 3)
		},
		{
			race_id: race2_3Id,
			cyclist_id: cyclistLinked1Id,
			place: 4,
			time: null,
			ranking_point_id: await getRankingPointId(rankingRegionalId, 4)
		},
		{
			race_id: race2_3Id,
			cyclist_id: cyclistUnlinked3Id,
			place: 5,
			time: null,
			ranking_point_id: await getRankingPointId(rankingRegionalId, 5)
		}
	]);

	console.log(`   ✅ Event 2 results created (15 results)`);

	// Event 3 - Race 1 (Elite Male Long Custom) - PRIVATE RACE
	const race3_1Id = await getRaceId(eventIds.event3, catEliteId, genderMaleId);
	await supabase.from('race_results').insert([
		{
			race_id: race3_1Id,
			cyclist_id: cyclistLinked1Id,
			place: 1,
			time: null,
			ranking_point_id: await getRankingPointId(rankingCustomId, 1)
		},
		{
			race_id: race3_1Id,
			cyclist_id: cyclistUnlinked5Id,
			place: 2,
			time: null,
			ranking_point_id: await getRankingPointId(rankingCustomId, 2)
		},
		{
			race_id: race3_1Id,
			cyclist_id: cyclistLinked3Id,
			place: 3,
			time: null,
			ranking_point_id: await getRankingPointId(rankingCustomId, 3)
		},
		{
			race_id: race3_1Id,
			cyclist_id: cyclistUnlinked1Id,
			place: 4,
			time: null,
			ranking_point_id: await getRankingPointId(rankingCustomId, 4)
		},
		{
			race_id: race3_1Id,
			cyclist_id: cyclistUnlinked3Id,
			place: 5,
			time: null,
			ranking_point_id: await getRankingPointId(rankingCustomId, 5)
		}
	]);

	// Event 3 - Race 2 (JA_15_16 Open Short Custom) - PRIVATE RACE
	const race3_2Id = await getRaceId(eventIds.event3, catJa1516Id, genderOpenId);
	await supabase.from('race_results').insert([
		{
			race_id: race3_2Id,
			cyclist_id: cyclistUnlinked3Id,
			place: 1,
			time: null,
			ranking_point_id: await getRankingPointId(rankingCustomId, 1)
		},
		{
			race_id: race3_2Id,
			cyclist_id: cyclistUnlinked4Id,
			place: 2,
			time: null,
			ranking_point_id: await getRankingPointId(rankingCustomId, 2)
		},
		{
			race_id: race3_2Id,
			cyclist_id: cyclistLinked2Id,
			place: 3,
			time: null,
			ranking_point_id: await getRankingPointId(rankingCustomId, 3)
		},
		{
			race_id: race3_2Id,
			cyclist_id: cyclistLinked1Id,
			place: 4,
			time: null,
			ranking_point_id: await getRankingPointId(rankingCustomId, 4)
		},
		{
			race_id: race3_2Id,
			cyclist_id: cyclistUnlinked2Id,
			place: 5,
			time: null,
			ranking_point_id: await getRankingPointId(rankingCustomId, 5)
		}
	]);

	// Event 3 - Race 3 (MA Female Short Custom) - PUBLIC RACE in PRIVATE EVENT
	const race3_3Id = await getRaceId(eventIds.event3, catMaId, genderFemaleId);
	await supabase.from('race_results').insert([
		{
			race_id: race3_3Id,
			cyclist_id: cyclistLinked2Id,
			place: 1,
			time: null,
			ranking_point_id: await getRankingPointId(rankingCustomId, 1)
		},
		{
			race_id: race3_3Id,
			cyclist_id: cyclistUnlinked2Id,
			place: 2,
			time: null,
			ranking_point_id: await getRankingPointId(rankingCustomId, 2)
		},
		{
			race_id: race3_3Id,
			cyclist_id: cyclistUnlinked4Id,
			place: 3,
			time: null,
			ranking_point_id: await getRankingPointId(rankingCustomId, 3)
		}
	]);

	console.log(`   ✅ Event 3 results created (13 results)`);

	// Event 4 - Race 1 (Elite Male Long UCI) - ONGOING
	const race4_1Id = await getRaceId(eventIds.event4, catEliteId, genderMaleId);
	await supabase.from('race_results').insert([
		{
			race_id: race4_1Id,
			cyclist_id: cyclistLinked1Id,
			place: 1,
			time: '02:52:15',
			ranking_point_id: await getRankingPointId(rankingUciId, 1)
		},
		{
			race_id: race4_1Id,
			cyclist_id: cyclistLinked3Id,
			place: 2,
			time: '02:53:00',
			ranking_point_id: await getRankingPointId(rankingUciId, 2)
		},
		{
			race_id: race4_1Id,
			cyclist_id: cyclistUnlinked5Id,
			place: 3,
			time: '02:54:30',
			ranking_point_id: await getRankingPointId(rankingUciId, 3)
		},
		{
			race_id: race4_1Id,
			cyclist_id: cyclistUnlinked1Id,
			place: 4,
			time: '02:56:00',
			ranking_point_id: await getRankingPointId(rankingUciId, 4)
		},
		{
			race_id: race4_1Id,
			cyclist_id: cyclistUnlinked3Id,
			place: 5,
			time: '02:58:45',
			ranking_point_id: await getRankingPointId(rankingUciId, 5)
		}
	]);

	// Event 4 - Race 2 (Elite Female Long UCI) - ONGOING
	const race4_2Id = await getRaceId(eventIds.event4, catEliteId, genderFemaleId);
	await supabase.from('race_results').insert([
		{
			race_id: race4_2Id,
			cyclist_id: cyclistLinked2Id,
			place: 1,
			time: '03:15:20',
			ranking_point_id: await getRankingPointId(rankingUciId, 1)
		},
		{
			race_id: race4_2Id,
			cyclist_id: cyclistUnlinked2Id,
			place: 2,
			time: '03:17:45',
			ranking_point_id: await getRankingPointId(rankingUciId, 2)
		},
		{
			race_id: race4_2Id,
			cyclist_id: cyclistUnlinked4Id,
			place: 3,
			time: '03:20:10',
			ranking_point_id: await getRankingPointId(rankingUciId, 3)
		}
	]);

	// Event 4 - Race 3 (MB Male Short National) - ONGOING
	const race4_3Id = await getRaceId(eventIds.event4, catMbId, genderMaleId);
	await supabase.from('race_results').insert([
		{
			race_id: race4_3Id,
			cyclist_id: cyclistUnlinked5Id,
			place: 1,
			time: '01:25:30',
			ranking_point_id: await getRankingPointId(rankingNationalId, 1)
		},
		{
			race_id: race4_3Id,
			cyclist_id: cyclistLinked3Id,
			place: 2,
			time: '01:26:15',
			ranking_point_id: await getRankingPointId(rankingNationalId, 2)
		},
		{
			race_id: race4_3Id,
			cyclist_id: cyclistUnlinked1Id,
			place: 3,
			time: '01:27:50',
			ranking_point_id: await getRankingPointId(rankingNationalId, 3)
		},
		{
			race_id: race4_3Id,
			cyclist_id: cyclistLinked1Id,
			place: 4,
			time: '01:29:00',
			ranking_point_id: await getRankingPointId(rankingNationalId, 4)
		},
		{
			race_id: race4_3Id,
			cyclist_id: cyclistUnlinked3Id,
			place: 5,
			time: '01:30:45',
			ranking_point_id: await getRankingPointId(rankingNationalId, 5)
		}
	]);

	console.log(`   ✅ Event 4 results created (13 results)`);
	console.log(`\n   🎉 Total: ~54 race results created`);
}

/**
 * Main seeding function
 */
async function seedUsers(): Promise<void> {
	console.log('🚀 Starting Supabase user seeding...\n');
	console.log('═══════════════════════════════════════════════════════');

	try {
		// Step 1: Create all test users sequentially
		console.log('👥 Creating users...');
		for (const user of TEST_USERS) {
			await createTestUser(user);
		}

		// Step 2: Create events (requires users for created_by field)
		const eventIds = await seedEvents();

		// Step 3: Create races (requires events)
		await seedRaces(eventIds);

		// Step 4: Create race results (requires races and cyclists)
		await seedRaceResults(eventIds);

		console.log('\n═══════════════════════════════════════════════════════');
		console.log('\n✅ Complete database seeding finished successfully!\n');
		console.log('📋 Test User Credentials:');
		console.log('   Admin:          admin@acs.com / #admin123');
		console.log('   Organizer:      organizer@example.com / password123');
		console.log('   Staff:          staff@example.com / password123');
		console.log('   Cyclist 1:      cyclist1@example.com / password123');
		console.log('   Cyclist 2:      cyclist2@example.com / password123');
		console.log('   Cyclist 3:      cyclist3@example.com / password123');
		console.log('\n📊 Data Created:');
		console.log('   - 6 Users (admin, organizer, staff, 3 cyclists)');
		console.log('   - 2 Organizations (from seed.sql)');
		console.log('   - 5 Unlinked cyclists (from seed.sql)');
		console.log('   - 4 Events (past, future, draft, ongoing)');
		console.log('   - 12 Races (3 per event)');
		console.log('   - ~54 Race Results');
		console.log('   - All 4 Ranking Systems with points (from seed.sql)');
		console.log('');
	} catch (error) {
		console.error('\n❌ Seeding failed:');
		console.error(error);
		process.exit(1);
	}
}

// Run the seeding script
seedUsers();

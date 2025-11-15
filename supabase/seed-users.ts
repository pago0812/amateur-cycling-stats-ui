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
 * Features:
 *   - Deletes all existing users before seeding (prevents duplicates)
 *   - Creates 6 test users (admin, organizer, staff, 3 cyclists)
 *   - Creates 45 anonymous cyclists
 *   - Creates 5 events (3 past, 1 future, 1 draft)
 *   - Creates 20 races (4 per event)
 *   - Creates ~100 race results (5 per race)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
	seedUsers as usersData,
	seedAnonymousCyclists as anonymousCyclistsData,
	seedEvents as eventsData,
	seedRaces as racesData,
	seedRaceResults as raceResultsData,
	type TestUser
} from './seed-data';

// ============================================================================
// ENVIRONMENT SETUP
// ============================================================================

/**
 * Load environment variables from .env file
 */
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
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
	console.error('❌ Missing required environment variables:');
	console.error('   - SUPABASE_URL');
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

// ============================================================================
// CLEANUP FUNCTIONS
// ============================================================================

/**
 * Delete all existing users from the database
 * This prevents duplicate user errors when re-running the seed script
 */
async function cleanupExistingUsers(): Promise<void> {
	console.log('\n🧹 Cleaning up existing users...');

	try {
		// Get all users from auth.users
		const { data: users, error: listError } = await supabase.auth.admin.listUsers();

		if (listError) {
			throw new Error(`Failed to list users: ${listError.message}`);
		}

		if (!users || users.users.length === 0) {
			console.log('   ℹ️  No existing users found, skipping cleanup');
			return;
		}

		console.log(`   Found ${users.users.length} existing users, deleting...`);

		// Delete each user
		for (const user of users.users) {
			const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

			if (deleteError) {
				console.error(`   ⚠️  Failed to delete user ${user.email}: ${deleteError.message}`);
			} else {
				console.log(`   ✅ Deleted user: ${user.email}`);
			}
		}

		console.log(`   🎉 Cleanup complete! Deleted ${users.users.length} users`);
	} catch (error) {
		console.error('\n❌ Cleanup failed:');
		console.error(error);
		throw error;
	}
}

// ============================================================================
// HELPER FUNCTIONS - LOOKUP IDs
// ============================================================================

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
		throw new Error(`Failed to find race category gender: ${genderName}. Error: ${error?.message}`);
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
		throw new Error(`Failed to find race category length: ${lengthName}. Error: ${error?.message}`);
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
 * Get cyclist ID by auth user ID (converts to public user ID first)
 */
async function getCyclistIdByUserId(authUserId: string): Promise<string> {
	// First get the public user ID from auth user ID
	const { data: userData, error: userError } = await supabase
		.from('users')
		.select('id')
		.eq('auth_user_id', authUserId)
		.single();

	if (userError || !userData) {
		throw new Error(
			`Failed to find public user for auth ID: ${authUserId}. Error: ${userError?.message}`
		);
	}

	// Then get the cyclist ID
	const { data, error } = await supabase
		.from('cyclists')
		.select('id')
		.eq('user_id', userData.id)
		.single();

	if (error || !data) {
		throw new Error(
			`Failed to find cyclist for public user: ${userData.id}. Error: ${error?.message}`
		);
	}

	return data.id;
}

// ============================================================================
// SEEDING FUNCTIONS - USERS
// ============================================================================

/**
 * Create a test user with Supabase Admin API
 */
async function createTestUser(user: TestUser): Promise<void> {
	console.log(`\n📝 Creating user: ${user.email} (${user.roleName})`);

	// Step 1: Create auth.users entry using Admin API
	const { data: authData, error: authError } = await supabase.auth.admin.createUser({
		id: user.id,
		email: user.email,
		password: user.password,
		email_confirm: true,
		user_metadata: {
			first_name: user.firstName,
			last_name: user.lastName || null
		}
	});

	if (authError) {
		throw new Error(`Failed to create auth user: ${authError.message}`);
	}

	console.log(`   ✅ Auth user created: ${authData.user.id}`);

	// Step 2: Get role ID
	const roleId = await getRoleId(user.roleName);
	console.log(`   ✅ Role found: ${user.roleName} (${roleId})`);

	// Step 3: Create or update public.users entry
	const { error: userError } = await supabase.from('users').upsert(
		{
			auth_user_id: user.id,
			first_name: user.firstName,
			last_name: user.lastName || null,
			role_id: roleId
		},
		{
			onConflict: 'auth_user_id'
		}
	);

	if (userError) {
		throw new Error(`Failed to create/update public.users: ${userError.message}`);
	}

	console.log(`   ✅ Public user profile created/updated`);

	// Step 4: Handle cyclist-specific data
	if (user.cyclistData) {
		const genderId = await getCyclistGenderId(user.cyclistData.gender);

		// Update the auto-created cyclist profile (names come from users table now)
		const { error: cyclistError } = await supabase
			.from('cyclists')
			.update({
				born_year: user.cyclistData.bornYear,
				gender_id: genderId
			})
			.eq(
				'user_id',
				(await supabase.from('users').select('id').eq('auth_user_id', user.id).single()).data?.id
			);

		if (cyclistError) {
			throw new Error(`Failed to update cyclist profile: ${cyclistError.message}`);
		}

		console.log(`   ✅ Cyclist profile updated: ${user.firstName} ${user.lastName}`);
	}

	// Step 5: Handle organizer-specific data
	if (user.organizerData) {
		const organizationId = await getOrganizationId(user.organizerData.organizationName);

		// Get the public.users.id (not auth user id)
		const { data: publicUser, error: getUserError } = await supabase
			.from('users')
			.select('id')
			.eq('auth_user_id', user.id)
			.single();

		if (getUserError || !publicUser) {
			throw new Error(`Failed to get public user ID: ${getUserError?.message}`);
		}

		// Create organizer profile
		const { error: organizerError } = await supabase.from('organizers').upsert(
			{
				user_id: publicUser.id,
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

// ============================================================================
// SEEDING FUNCTIONS - CYCLISTS
// ============================================================================

/**
 * Create anonymous cyclists (cyclists without auth accounts)
 * Creates User records first, then links cyclist profiles to them
 */
async function createAnonymousCyclists(): Promise<Map<string, string>> {
	console.log('\n\n👥 Creating anonymous cyclists (users without auth accounts)...');

	const cyclistIdMap = new Map<string, string>();
	const cyclistRoleId = await getRoleId('CYCLIST');

	for (let i = 0; i < anonymousCyclistsData.length; i++) {
		const cyclist = anonymousCyclistsData[i];
		const genderId = await getCyclistGenderId(cyclist.gender);

		// Step 1: Create User record WITHOUT auth_user_id
		// Note: The trigger will automatically create a cyclist profile
		const { data: userData, error: userError } = await supabase
			.from('users')
			.insert({
				first_name: cyclist.name,
				last_name: cyclist.lastName,
				role_id: cyclistRoleId,
				auth_user_id: null // No auth account for anonymous cyclists
			})
			.select('id')
			.single();

		if (userError || !userData) {
			throw new Error(
				`Failed to create user for anonymous cyclist ${cyclist.name} ${cyclist.lastName}: ${userError?.message}`
			);
		}

		// Step 2: Update the auto-created cyclist profile with birth year and gender
		const { data: cyclistData, error: cyclistError } = await supabase
			.from('cyclists')
			.update({
				born_year: cyclist.bornYear,
				gender_id: genderId
			})
			.eq('user_id', userData.id)
			.select('id')
			.single();

		if (cyclistError || !cyclistData) {
			throw new Error(
				`Failed to update cyclist profile for ${cyclist.name} ${cyclist.lastName}: ${cyclistError?.message}`
			);
		}

		// Store mapping: anon-0 -> cyclist UUID
		cyclistIdMap.set(`anon-${i}`, cyclistData.id);

		if ((i + 1) % 10 === 0) {
			console.log(`   ✅ Created ${i + 1} / ${anonymousCyclistsData.length} cyclists`);
		}
	}

	console.log(`   🎉 Total: ${anonymousCyclistsData.length} anonymous cyclists created`);
	return cyclistIdMap;
}

// ============================================================================
// SEEDING FUNCTIONS - EVENTS
// ============================================================================

/**
 * Seed events (requires users to exist for created_by field)
 */
async function seedEvents(): Promise<void> {
	console.log('\n\n📅 Creating events...');

	for (const event of eventsData) {
		// Get organization ID
		const organizationId = await getOrganizationId(event.organizationName);

		// Get the public.users.id from auth user id
		const { data: publicUser, error: getUserError } = await supabase
			.from('users')
			.select('id')
			.eq('auth_user_id', event.createdByUserId)
			.single();

		if (getUserError || !publicUser) {
			throw new Error(`Failed to get public user ID for creator: ${getUserError?.message}`);
		}

		// Get category, gender, and length IDs for supported configurations
		const categoryIds = await Promise.all(
			event.supportedCategories.map((cat) => getRaceCategoryId(cat))
		);
		const genderIds = await Promise.all(
			event.supportedGenders.map((gender) => getRaceCategoryGenderId(gender))
		);
		const lengthIds = await Promise.all(
			event.supportedLengths.map((length) => getRaceCategoryLengthId(length))
		);

		// Create event
		const { error: eventError } = await supabase.from('events').insert({
			id: event.id,
			name: event.name,
			city: event.city,
			country: event.country,
			state: event.state,
			date_time: event.dateTime,
			year: event.year,
			event_status: event.eventStatus,
			is_public_visible: event.isPublicVisible,
			created_by: publicUser.id,
			organization_id: organizationId
		});

		if (eventError) throw new Error(`Failed to create event ${event.name}: ${eventError.message}`);

		// Create event supported configurations
		const categoriesData = categoryIds.map((catId) => ({
			event_id: event.id,
			race_category_id: catId
		}));
		const { error: catError } = await supabase
			.from('event_supported_categories')
			.insert(categoriesData);
		if (catError) throw new Error(`Failed to create supported categories: ${catError.message}`);

		const gendersData = genderIds.map((genderId) => ({
			event_id: event.id,
			race_category_gender_id: genderId
		}));
		const { error: genderError } = await supabase
			.from('event_supported_genders')
			.insert(gendersData);
		if (genderError) throw new Error(`Failed to create supported genders: ${genderError.message}`);

		const lengthsData = lengthIds.map((lengthId) => ({
			event_id: event.id,
			race_category_length_id: lengthId
		}));
		const { error: lengthError } = await supabase
			.from('event_supported_lengths')
			.insert(lengthsData);
		if (lengthError) throw new Error(`Failed to create supported lengths: ${lengthError.message}`);

		console.log(`   ✅ Event created: ${event.name} (${event.eventStatus})`);
	}

	console.log(`   🎉 Total: ${eventsData.length} events created`);
}

// ============================================================================
// SEEDING FUNCTIONS - RACES
// ============================================================================

/**
 * Seed races (requires events to exist)
 */
async function seedRaces(): Promise<void> {
	console.log('\n\n🏁 Creating races...');

	for (const race of racesData) {
		// Get category, gender, length, and ranking IDs
		const categoryId = await getRaceCategoryId(race.categoryName);
		const genderId = await getRaceCategoryGenderId(race.genderName);
		const lengthId = await getRaceCategoryLengthId(race.lengthName);
		const rankingId = await getRaceRankingId(race.rankingName);

		// Create race
		const { data: raceData, error: raceError } = await supabase
			.from('races')
			.insert({
				event_id: race.eventId,
				date_time: race.dateTime,
				race_category_id: categoryId,
				race_category_gender_id: genderId,
				race_category_length_id: lengthId,
				race_ranking_id: rankingId,
				is_public_visible: race.isPublicVisible
			})
			.select('id');

		if (raceError) {
			console.error(`   ❌ Failed to create race for event ${race.eventId}:`);
			console.error(
				`      Category: ${race.categoryName}, Gender: ${race.genderName}, Length: ${race.lengthName}`
			);
			console.error(`      Error: ${raceError.message}`);
			throw new Error(`Failed to create race: ${raceError.message}`);
		}

		if (!raceData || raceData.length === 0) {
			console.error(`   ❌ Race created but no data returned for event ${race.eventId}`);
		}
	}

	// Verify races were actually created
	const { data: allRaces, error: countError } = await supabase
		.from('races')
		.select('id', { count: 'exact' });

	console.log(`   ✅ Total: ${racesData.length} races created`);
	console.log(`   ✅ Verification: ${allRaces?.length || 0} races in database`);
}

// ============================================================================
// SEEDING FUNCTIONS - RACE RESULTS
// ============================================================================

/**
 * Seed race results (requires races and cyclists to exist)
 */
async function seedRaceResults(cyclistIdMap: Map<string, string>): Promise<void> {
	console.log('\n\n🏆 Creating race results...');

	let resultsCreated = 0;

	for (const result of raceResultsData) {
		// Resolve cyclist ID (either from linked user or anonymous cyclist map)
		let cyclistId: string;
		if (result.cyclistIdentifier.startsWith('anon-')) {
			const mappedId = cyclistIdMap.get(result.cyclistIdentifier);
			if (!mappedId) {
				throw new Error(`Failed to find anonymous cyclist ID for: ${result.cyclistIdentifier}`);
			}
			cyclistId = mappedId;
		} else {
			// It's a user ID, get the cyclist ID
			cyclistId = await getCyclistIdByUserId(result.cyclistIdentifier);
		}

		// Get race ID
		const categoryId = await getRaceCategoryId(result.categoryName);
		const genderId = await getRaceCategoryGenderId(result.genderName);
		const lengthId = await getRaceCategoryLengthId(result.lengthName);

		const { data: raceData, error: raceError } = await supabase
			.from('races')
			.select('id')
			.eq('event_id', result.eventId)
			.eq('race_category_id', categoryId)
			.eq('race_category_gender_id', genderId)
			.eq('race_category_length_id', lengthId)
			.single();

		if (raceError || !raceData) {
			throw new Error(`Failed to find race for result: ${raceError?.message}`);
		}

		// Get ranking point ID
		const rankingId = await getRaceRankingId(result.rankingName);
		const rankingPointId = await getRankingPointId(rankingId, result.place);

		// Create race result
		const { error: resultError } = await supabase.from('race_results').insert({
			race_id: raceData.id,
			cyclist_id: cyclistId,
			place: result.place,
			time: result.time,
			ranking_point_id: rankingPointId
		});

		if (resultError) throw new Error(`Failed to create race result: ${resultError.message}`);

		resultsCreated++;

		if (resultsCreated % 20 === 0) {
			console.log(`   ✅ Created ${resultsCreated} / ${raceResultsData.length} results`);
		}
	}

	console.log(`   🎉 Total: ${resultsCreated} race results created`);
}

// ============================================================================
// MAIN SEEDING FUNCTION
// ============================================================================

/**
 * Main seeding function
 */
async function seedDatabase(): Promise<void> {
	console.log('🚀 Starting Supabase database seeding...\n');
	console.log('═══════════════════════════════════════════════════════');

	try {
		// Step 0: Cleanup existing users
		await cleanupExistingUsers();

		// Step 1: Create all test users
		console.log('\n\n👥 Creating users...');
		for (const user of usersData) {
			await createTestUser(user);
		}

		// Step 2: Create anonymous cyclists
		const cyclistIdMap = await createAnonymousCyclists();

		// Step 3: Create events
		await seedEvents();

		// Step 4: Create races
		await seedRaces();

		// Step 5: Create race results
		await seedRaceResults(cyclistIdMap);

		console.log('\n═══════════════════════════════════════════════════════');
		console.log('\n✅ Complete database seeding finished successfully!\n');
		console.log('📋 Test User Credentials:');
		console.log('   Admin:          admin@acs.com / #admin123');
		console.log('   Organizer:      organizer@example.com / password123');
		console.log('   Staff:          staff@example.com / password123');
		console.log('   Cyclist 1:      cyclist1@example.com / password123 (Carlos Rodríguez)');
		console.log('   Cyclist 2:      cyclist2@example.com / password123 (María García)');
		console.log('   Cyclist 3:      cyclist3@example.com / password123 (Javier Martínez)');
		console.log('\n📊 Data Created:');
		console.log(`   - ${usersData.length} Users (1 admin, 2 organizers, 3 cyclists)`);
		console.log('   - 2 Organizations (from seed.sql)');
		console.log(`   - ${anonymousCyclistsData.length} Anonymous cyclists`);
		console.log(`   - ${eventsData.length} Events (3 past, 1 future, 1 draft)`);
		console.log(
			`   - ${racesData.length} Races (4 per event, ELITE/MA only, MALE/FEMALE, LONG/SHORT)`
		);
		console.log(`   - ${raceResultsData.length} Race Results (5 per race)`);
		console.log('   - All 4 Ranking Systems with points (from seed.sql)');
		console.log('');
	} catch (error) {
		console.error('\n❌ Seeding failed:');
		console.error(error);
		process.exit(1);
	}
}

// Run the seeding script
seedDatabase();

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
	console.error('❌ Missing Supabase credentials in .env file');
	process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false
	}
});

// Test users to update (excluding admin)
const testUserEmails = [
	'cyclist1@example.com',
	'cyclist2@example.com',
	'organizer@example.com',
	'organizer_staff@example.com'
];

async function updateTestPasswords() {
	console.log('🔐 Starting password update for test users...\n');

	// Hash the password using bcrypt (Supabase uses bcrypt with salt rounds 10)
	const plainPassword = 'password123';
	const hashedPassword = await bcrypt.hash(plainPassword, 10);

	console.log(`✅ Generated bcrypt hash for "${plainPassword}"`);
	console.log(`   Hash: ${hashedPassword}\n`);

	let successCount = 0;
	let errorCount = 0;

	for (const email of testUserEmails) {
		try {
			// Update the encrypted_password directly in auth.users table
			const { data, error } = await supabase.rpc('update_user_password', {
				user_email: email,
				new_password_hash: hashedPassword
			});

			if (error) {
				// If the RPC function doesn't exist, we'll use direct SQL via a migration instead
				if (error.message.includes('function') && error.message.includes('does not exist')) {
					console.log(`⚠️  RPC function not available, will use migration approach instead`);
					break;
				}
				console.error(`❌ Failed to update ${email}: ${error.message}`);
				errorCount++;
			} else {
				console.log(`✅ Updated password for ${email}`);
				successCount++;
			}
		} catch (err) {
			console.error(`❌ Error updating ${email}:`, err.message);
			errorCount++;
		}
	}

	console.log(`\n📊 Summary:`);
	console.log(`   ✅ Success: ${successCount}`);
	console.log(`   ❌ Errors: ${errorCount}`);

	if (errorCount > 0) {
		console.log(`\n💡 If RPC approach failed, use migration file instead.`);
		console.log(`   The bcrypt hash to use is:`);
		console.log(`   ${hashedPassword}`);
	}
}

updateTestPasswords().catch((err) => {
	console.error('💥 Unexpected error:', err);
	process.exit(1);
});

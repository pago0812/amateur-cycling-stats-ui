import bcrypt from 'bcrypt';

// Hash password123 using bcrypt with 10 salt rounds (Supabase default)
const plainPassword = 'password123';

console.log('🔐 Generating bcrypt hash for password...\n');

bcrypt.hash(plainPassword, 10).then((hash) => {
	console.log(`Password: ${plainPassword}`);
	console.log(`Bcrypt hash: ${hash}\n`);
	console.log('✅ Copy this hash to use in the migration file');
}).catch((err) => {
	console.error('❌ Error generating hash:', err);
	process.exit(1);
});

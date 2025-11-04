-- =====================================================
-- UPDATE TEST USERS PASSWORDS
-- =====================================================
-- Update all test users with correctly hashed 'password123' password
-- The bcrypt hash was generated using bcrypt with 10 salt rounds
-- Password: password123
-- Hash: $2b$10$MiCMZmomtqkQp25y7WJ5Nep8d2ZHx1Mo.ad0EV9065wXoqXxxr/N2

UPDATE auth.users
SET encrypted_password = '$2b$10$MiCMZmomtqkQp25y7WJ5Nep8d2ZHx1Mo.ad0EV9065wXoqXxxr/N2'
WHERE email IN (
    'cyclist1@example.com',
    'cyclist2@example.com',
    'organizer@example.com',
    'organizer_staff@example.com'
);

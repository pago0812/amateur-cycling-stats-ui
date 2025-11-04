-- =====================================================
-- FIX TEST USERS AUTH FIELDS
-- =====================================================
-- Update all auth.users to include the required timestamp fields
-- that were missing from the original seed inserts

UPDATE auth.users
SET
    recovery_sent_at = COALESCE(recovery_sent_at, NOW()),
    last_sign_in_at = COALESCE(last_sign_in_at, NOW())
WHERE
    recovery_sent_at IS NULL
    OR last_sign_in_at IS NULL;

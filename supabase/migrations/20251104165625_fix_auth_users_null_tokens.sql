-- =====================================================
-- FIX AUTH.USERS NULL TOKEN FIELDS
-- =====================================================
-- Supabase Auth expects certain token fields to be empty strings, not NULL
-- This causes "converting NULL to string is unsupported" errors during login

-- Update all NULL token fields to empty strings
UPDATE auth.users
SET
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    reauthentication_token = COALESCE(reauthentication_token, ''),
    email_change = COALESCE(email_change, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, '')
WHERE
    confirmation_token IS NULL
    OR recovery_token IS NULL
    OR email_change_token_new IS NULL
    OR email_change_token_current IS NULL
    OR reauthentication_token IS NULL
    OR email_change IS NULL
    OR phone_change IS NULL
    OR phone_change_token IS NULL;

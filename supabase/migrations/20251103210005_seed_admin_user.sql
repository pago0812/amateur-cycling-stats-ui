-- =====================================================
-- SEED DATA: Initial Admin User
-- =====================================================
-- Creates an admin user for initial access to the application
-- Email: admin@acs.com
-- Password: #admin123

-- Create the admin user in auth.users table
DO $$
DECLARE
    admin_user_id UUID;
    admin_role_id UUID;
BEGIN
    -- Generate a fixed UUID for the admin user (for consistency across environments)
    admin_user_id := 'a0000000-0000-0000-0000-000000000001'::UUID;

    -- Get the ADMIN role ID
    SELECT id INTO admin_role_id FROM public.roles WHERE type = 'admin' LIMIT 1;

    -- Insert admin user into auth.users table
    -- Password: #admin123 (pre-hashed with bcrypt)
    -- Bcrypt hash generated for password: #admin123
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        admin_user_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'admin@acs.com',
        '$2b$10$tepXqe/LnB8X0Z2RjM0SreSBquipAyyjeJyRu00dsn1SnqalNl1Qi', -- Bcrypt hash for #admin123
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"username":"admin"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    ) ON CONFLICT (id) DO NOTHING;

    -- The trigger will automatically create the user profile with CYCLIST role,
    -- but we need to update it to ADMIN role
    -- Update the user profile to set ADMIN role
    UPDATE public.users
    SET role_id = admin_role_id
    WHERE id = admin_user_id;

    -- If the user profile doesn't exist (in case trigger didn't fire), create it manually
    INSERT INTO public.users (id, username, role_id)
    VALUES (admin_user_id, 'admin', admin_role_id)
    ON CONFLICT (id) DO UPDATE SET role_id = admin_role_id;

    RAISE NOTICE 'Admin user created successfully: admin@acs.com';
END $$;

-- Verify the admin user was created
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE r.type = 'admin';

    IF user_count > 0 THEN
        RAISE NOTICE 'Verification: Found % admin user(s)', user_count;
    ELSE
        RAISE WARNING 'Verification: No admin users found!';
    END IF;
END $$;

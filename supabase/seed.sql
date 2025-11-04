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
    -- Password: #admin123 (pre-hashed bcrypt)
    -- Generated using: bcrypt.hash('#admin123', 10)
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
        '$2a$10$rFJ1UQM4xNW3.e3DX8zJ9OqQqJ7rJ8mLK5vZH8pHqF5e8Fc5Z0rCG', -- Bcrypt hash of #admin123
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

-- =====================================================
-- TEST SEED DATA
-- =====================================================
-- Comprehensive test data for development and testing
-- Covers: Organizations, Users, Cyclists, Events, Races, Results
--
-- Test Users:
-- - organizer@example.com / password123 (Organizer Admin)
-- - staff@example.com / password123 (Organizer Staff)
-- - cyclist1@example.com / password123 (Cyclist)
-- - cyclist2@example.com / password123 (Cyclist)
-- - cyclist3@example.com / password123 (Cyclist)
-- =====================================================

DO $$
DECLARE
    -- Role IDs
    cyclist_role_id UUID;
    organizer_role_id UUID;
    organizer_staff_role_id UUID;

    -- Organization IDs
    org_pro_league_id UUID;
    org_valencia_fed_id UUID;

    -- User IDs
    user_organizer_id UUID;
    user_staff_id UUID;
    user_cyclist1_id UUID;
    user_cyclist2_id UUID;
    user_cyclist3_id UUID;

    -- Cyclist IDs (unlinked)
    cyclist_unlinked1_id UUID;
    cyclist_unlinked2_id UUID;
    cyclist_unlinked3_id UUID;
    cyclist_unlinked4_id UUID;
    cyclist_unlinked5_id UUID;

    -- Cyclist IDs (linked to users)
    cyclist_linked1_id UUID;
    cyclist_linked2_id UUID;
    cyclist_linked3_id UUID;

    -- Cyclist Gender IDs
    gender_m_id UUID;
    gender_f_id UUID;

    -- Event IDs
    event_past_id UUID;
    event_future_id UUID;
    event_draft_id UUID;
    event_ongoing_id UUID;

    -- Race IDs (3 per event = 12 total)
    race_id UUID;

    -- Category/Gender/Length/Ranking IDs
    cat_elite_id UUID;
    cat_ma_id UUID;
    cat_mb_id UUID;
    cat_es_19_23_id UUID;
    cat_ja_15_16_id UUID;

    gender_male_id UUID;
    gender_female_id UUID;
    gender_open_id UUID;

    length_long_id UUID;
    length_short_id UUID;

    ranking_uci_id UUID;
    ranking_national_id UUID;
    ranking_regional_id UUID;
    ranking_custom_id UUID;

    -- Ranking Point IDs
    uci_1st_id UUID;
    uci_2nd_id UUID;
    uci_3rd_id UUID;
    national_1st_id UUID;
    national_2nd_id UUID;
    regional_1st_id UUID;
    custom_1st_id UUID;

BEGIN
    RAISE NOTICE 'Starting test seed data creation...';

    -- =====================================================
    -- 1. GET ROLE IDs
    -- =====================================================
    SELECT id INTO cyclist_role_id FROM public.roles WHERE type = 'cyclist' LIMIT 1;
    SELECT id INTO organizer_role_id FROM public.roles WHERE type = 'organizer' LIMIT 1;
    SELECT id INTO organizer_staff_role_id FROM public.roles WHERE type = 'organizer_staff' LIMIT 1;

    -- =====================================================
    -- 2. CREATE ORGANIZATIONS
    -- =====================================================
    RAISE NOTICE '- Creating organizations...';

    org_pro_league_id := gen_random_uuid();
    INSERT INTO public.organizations (id, name, created_at, updated_at)
    VALUES (
        org_pro_league_id,
        'Pro Cycling League Spain',
        NOW(),
        NOW()
    );

    org_valencia_fed_id := gen_random_uuid();
    INSERT INTO public.organizations (id, name, created_at, updated_at)
    VALUES (
        org_valencia_fed_id,
        'Valencia Cycling Federation',
        NOW(),
        NOW()
    );

    -- =====================================================
    -- 3. CREATE TEST USERS
    -- =====================================================
    RAISE NOTICE '- Creating test users...';

    -- Organizer Admin User
    -- Password: password123 (pre-hashed bcrypt: $2a$10$N9qo8uLOickgx2ZMRZoMye/tKEHpVqKYl0SQZl7fWbE5qP8l1rT7G)
    user_organizer_id := gen_random_uuid();
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data
    ) VALUES (
        user_organizer_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'organizer@example.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMye/tKEHpVqKYl0SQZl7fWbE5qP8l1rT7G',
        NOW(), NOW(), NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"username":"organizer1"}'
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.users (id, username, role_id)
    VALUES (user_organizer_id, 'organizer1', organizer_role_id)
    ON CONFLICT (id) DO UPDATE SET role_id = organizer_role_id;

    -- Organizer Staff User
    user_staff_id := gen_random_uuid();
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data
    ) VALUES (
        user_staff_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'staff@example.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMye/tKEHpVqKYl0SQZl7fWbE5qP8l1rT7G',
        NOW(), NOW(), NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"username":"staff1"}'
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.users (id, username, role_id)
    VALUES (user_staff_id, 'staff1', organizer_staff_role_id)
    ON CONFLICT (id) DO UPDATE SET role_id = organizer_staff_role_id;

    -- Cyclist Users (3)
    user_cyclist1_id := gen_random_uuid();
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data
    ) VALUES (
        user_cyclist1_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'cyclist1@example.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMye/tKEHpVqKYl0SQZl7fWbE5qP8l1rT7G',
        NOW(), NOW(), NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"username":"cyclist1"}'
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.users (id, username, role_id)
    VALUES (user_cyclist1_id, 'cyclist1', cyclist_role_id)
    ON CONFLICT (id) DO NOTHING;

    user_cyclist2_id := gen_random_uuid();
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data
    ) VALUES (
        user_cyclist2_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'cyclist2@example.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMye/tKEHpVqKYl0SQZl7fWbE5qP8l1rT7G',
        NOW(), NOW(), NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"username":"cyclist2"}'
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.users (id, username, role_id)
    VALUES (user_cyclist2_id, 'cyclist2', cyclist_role_id)
    ON CONFLICT (id) DO NOTHING;

    user_cyclist3_id := gen_random_uuid();
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data
    ) VALUES (
        user_cyclist3_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'cyclist3@example.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMye/tKEHpVqKYl0SQZl7fWbE5qP8l1rT7G',
        NOW(), NOW(), NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"username":"cyclist3"}'
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.users (id, username, role_id)
    VALUES (user_cyclist3_id, 'cyclist3', cyclist_role_id)
    ON CONFLICT (id) DO NOTHING;

    -- =====================================================
    -- 4. CREATE ORGANIZER PROFILES
    -- =====================================================
    RAISE NOTICE '- Creating organizer profiles...';

    INSERT INTO public.organizers (user_id, organization_id, created_at, updated_at)
    VALUES
        (user_organizer_id, org_pro_league_id, NOW(), NOW()),
        (user_staff_id, org_valencia_fed_id, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- 5. GET CYCLIST GENDER IDs
    -- =====================================================
    SELECT id INTO gender_m_id FROM public.cyclist_genders WHERE name = 'M' LIMIT 1;
    SELECT id INTO gender_f_id FROM public.cyclist_genders WHERE name = 'F' LIMIT 1;

    -- =====================================================
    -- 6. CREATE CYCLIST PROFILES (LINKED)
    -- =====================================================
    RAISE NOTICE '- Creating linked cyclist profiles...';

    -- Update auto-created cyclist profiles with real data
    UPDATE public.cyclists
    SET name = 'Carlos', last_name = 'Rodríguez', born_year = 1995, gender_id = gender_m_id
    WHERE user_id = user_cyclist1_id
    RETURNING id INTO cyclist_linked1_id;

    UPDATE public.cyclists
    SET name = 'María', last_name = 'García', born_year = 1998, gender_id = gender_f_id
    WHERE user_id = user_cyclist2_id
    RETURNING id INTO cyclist_linked2_id;

    UPDATE public.cyclists
    SET name = 'Javier', last_name = 'Martínez', born_year = 1992, gender_id = gender_m_id
    WHERE user_id = user_cyclist3_id
    RETURNING id INTO cyclist_linked3_id;

    -- =====================================================
    -- 7. CREATE CYCLIST PROFILES (UNLINKED)
    -- =====================================================
    RAISE NOTICE '- Creating unlinked cyclist profiles...';

    cyclist_unlinked1_id := gen_random_uuid();
    INSERT INTO public.cyclists (id, name, last_name, born_year, gender_id, user_id, created_at, updated_at)
    VALUES (cyclist_unlinked1_id, 'Pedro', 'López', 1990, gender_m_id, NULL, NOW(), NOW());

    cyclist_unlinked2_id := gen_random_uuid();
    INSERT INTO public.cyclists (id, name, last_name, born_year, gender_id, user_id, created_at, updated_at)
    VALUES (cyclist_unlinked2_id, 'Ana', 'Fernández', 1996, gender_f_id, NULL, NOW(), NOW());

    cyclist_unlinked3_id := gen_random_uuid();
    INSERT INTO public.cyclists (id, name, last_name, born_year, gender_id, user_id, created_at, updated_at)
    VALUES (cyclist_unlinked3_id, 'Diego', 'Sánchez', 2003, gender_m_id, NULL, NOW(), NOW());

    cyclist_unlinked4_id := gen_random_uuid();
    INSERT INTO public.cyclists (id, name, last_name, born_year, gender_id, user_id, created_at, updated_at)
    VALUES (cyclist_unlinked4_id, 'Laura', 'Torres', 1999, gender_f_id, NULL, NOW(), NOW());

    cyclist_unlinked5_id := gen_random_uuid();
    INSERT INTO public.cyclists (id, name, last_name, born_year, gender_id, user_id, created_at, updated_at)
    VALUES (cyclist_unlinked5_id, 'Miguel', 'Ramírez', 1988, gender_m_id, NULL, NOW(), NOW());

    -- =====================================================
    -- 8. GET CATEGORY/GENDER/LENGTH/RANKING IDs
    -- =====================================================
    SELECT id INTO cat_elite_id FROM public.race_categories WHERE name = 'ELITE' LIMIT 1;
    SELECT id INTO cat_ma_id FROM public.race_categories WHERE name = 'MA' LIMIT 1;
    SELECT id INTO cat_mb_id FROM public.race_categories WHERE name = 'MB' LIMIT 1;
    SELECT id INTO cat_es_19_23_id FROM public.race_categories WHERE name = 'ES_19_23' LIMIT 1;
    SELECT id INTO cat_ja_15_16_id FROM public.race_categories WHERE name = 'JA_15_16' LIMIT 1;

    SELECT id INTO gender_male_id FROM public.race_category_genders WHERE name = 'MALE' LIMIT 1;
    SELECT id INTO gender_female_id FROM public.race_category_genders WHERE name = 'FEMALE' LIMIT 1;
    SELECT id INTO gender_open_id FROM public.race_category_genders WHERE name = 'OPEN' LIMIT 1;

    SELECT id INTO length_long_id FROM public.race_category_lengths WHERE name = 'LONG' LIMIT 1;
    SELECT id INTO length_short_id FROM public.race_category_lengths WHERE name = 'SHORT' LIMIT 1;

    SELECT id INTO ranking_uci_id FROM public.race_rankings WHERE name = 'UCI' LIMIT 1;
    SELECT id INTO ranking_national_id FROM public.race_rankings WHERE name = 'NATIONAL' LIMIT 1;
    SELECT id INTO ranking_regional_id FROM public.race_rankings WHERE name = 'REGIONAL' LIMIT 1;
    SELECT id INTO ranking_custom_id FROM public.race_rankings WHERE name = 'CUSTOM' LIMIT 1;

    -- =====================================================
    -- 9. CREATE RANKING POINTS
    -- =====================================================
    RAISE NOTICE '- Creating ranking points...';

    -- UCI Points (top 10)
    uci_1st_id := gen_random_uuid();
    INSERT INTO public.ranking_points (id, race_ranking_id, place, points) VALUES (uci_1st_id, ranking_uci_id, 1, 100);
    uci_2nd_id := gen_random_uuid();
    INSERT INTO public.ranking_points (id, race_ranking_id, place, points) VALUES (uci_2nd_id, ranking_uci_id, 2, 80);
    uci_3rd_id := gen_random_uuid();
    INSERT INTO public.ranking_points (id, race_ranking_id, place, points) VALUES (uci_3rd_id, ranking_uci_id, 3, 70);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_uci_id, 4, 60);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_uci_id, 5, 50);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_uci_id, 6, 40);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_uci_id, 7, 35);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_uci_id, 8, 30);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_uci_id, 9, 25);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_uci_id, 10, 20);

    -- National Points (top 10)
    national_1st_id := gen_random_uuid();
    INSERT INTO public.ranking_points (id, race_ranking_id, place, points) VALUES (national_1st_id, ranking_national_id, 1, 50);
    national_2nd_id := gen_random_uuid();
    INSERT INTO public.ranking_points (id, race_ranking_id, place, points) VALUES (national_2nd_id, ranking_national_id, 2, 40);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_national_id, 3, 35);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_national_id, 4, 30);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_national_id, 5, 25);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_national_id, 6, 20);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_national_id, 7, 18);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_national_id, 8, 16);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_national_id, 9, 14);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_national_id, 10, 12);

    -- Regional Points (top 10)
    regional_1st_id := gen_random_uuid();
    INSERT INTO public.ranking_points (id, race_ranking_id, place, points) VALUES (regional_1st_id, ranking_regional_id, 1, 25);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_regional_id, 2, 20);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_regional_id, 3, 18);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_regional_id, 4, 16);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_regional_id, 5, 14);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_regional_id, 6, 12);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_regional_id, 7, 10);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_regional_id, 8, 8);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_regional_id, 9, 6);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_regional_id, 10, 4);

    -- Custom Points (top 5)
    custom_1st_id := gen_random_uuid();
    INSERT INTO public.ranking_points (id, race_ranking_id, place, points) VALUES (custom_1st_id, ranking_custom_id, 1, 10);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_custom_id, 2, 8);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_custom_id, 3, 6);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_custom_id, 4, 4);
    INSERT INTO public.ranking_points (race_ranking_id, place, points) VALUES (ranking_custom_id, 5, 2);

    -- =====================================================
    -- 10. CREATE EVENTS
    -- =====================================================
    RAISE NOTICE '- Creating events...';

    -- Event 1: Past Public Event (FINISHED)
    event_past_id := gen_random_uuid();
    INSERT INTO public.events (
        id, name, city, country, state, date_time, year, event_status,
        is_public_visible, created_by, organization_id, created_at, updated_at
    ) VALUES (
        event_past_id,
        'Gran Fondo Madrid 2024',
        'Madrid',
        'España',
        'Madrid',
        '2024-06-15 09:00:00',
        2024,
        'FINISHED',
        true,
        user_organizer_id,
        org_pro_league_id,
        NOW(),
        NOW()
    );

    -- Event 2: Future Public Event (AVAILABLE)
    event_future_id := gen_random_uuid();
    INSERT INTO public.events (
        id, name, city, country, state, date_time, year, event_status,
        is_public_visible, created_by, organization_id, created_at, updated_at
    ) VALUES (
        event_future_id,
        'Tour de Valencia Amateur 2025',
        'Valencia',
        'España',
        'Valencia',
        '2025-09-20 08:00:00',
        2025,
        'AVAILABLE',
        true,
        user_staff_id,
        org_valencia_fed_id,
        NOW(),
        NOW()
    );

    -- Event 3: Future Private Event (DRAFT)
    event_draft_id := gen_random_uuid();
    INSERT INTO public.events (
        id, name, city, country, state, date_time, year, event_status,
        is_public_visible, created_by, organization_id, created_at, updated_at
    ) VALUES (
        event_draft_id,
        'Test Event 2025',
        'Barcelona',
        'España',
        'Cataluña',
        '2025-12-01 10:00:00',
        2025,
        'DRAFT',
        false,
        user_organizer_id,
        org_pro_league_id,
        NOW(),
        NOW()
    );

    -- Event 4: Current Event (ON_GOING)
    event_ongoing_id := gen_random_uuid();
    INSERT INTO public.events (
        id, name, city, country, state, date_time, year, event_status,
        is_public_visible, created_by, organization_id, created_at, updated_at
    ) VALUES (
        event_ongoing_id,
        'Campeonato Regional Andalucía 2025',
        'Sevilla',
        'España',
        'Andalucía',
        '2025-03-15 09:30:00',
        2025,
        'ON_GOING',
        true,
        user_organizer_id,
        org_pro_league_id,
        NOW(),
        NOW()
    );

    -- =====================================================
    -- 11. CREATE EVENT SUPPORTED CATEGORIES/GENDERS/LENGTHS
    -- =====================================================
    RAISE NOTICE '- Creating event supported configurations...';

    -- All events support multiple categories
    INSERT INTO public.event_supported_categories (event_id, race_category_id)
    SELECT e.id, rc.id
    FROM (VALUES
        (event_past_id), (event_future_id), (event_draft_id), (event_ongoing_id)
    ) AS e(id)
    CROSS JOIN (VALUES
        (cat_elite_id), (cat_ma_id), (cat_mb_id), (cat_es_19_23_id), (cat_ja_15_16_id)
    ) AS rc(id);

    -- All events support all genders
    INSERT INTO public.event_supported_genders (event_id, race_category_gender_id)
    SELECT e.id, rcg.id
    FROM (VALUES
        (event_past_id), (event_future_id), (event_draft_id), (event_ongoing_id)
    ) AS e(id)
    CROSS JOIN (VALUES
        (gender_male_id), (gender_female_id), (gender_open_id)
    ) AS rcg(id);

    -- All events support multiple lengths
    INSERT INTO public.event_supported_lengths (event_id, race_category_length_id)
    SELECT e.id, rcl.id
    FROM (VALUES
        (event_past_id), (event_future_id), (event_draft_id), (event_ongoing_id)
    ) AS e(id)
    CROSS JOIN (VALUES
        (length_long_id), (length_short_id)
    ) AS rcl(id);

    -- =====================================================
    -- 12. CREATE RACES (3 per event = 12 total)
    -- =====================================================
    RAISE NOTICE '- Creating races...';

    -- Event 1 Races (Past Event - all public, finished)
    INSERT INTO public.races (
        event_id, date_time, race_category_id, race_category_gender_id,
        race_category_length_id, race_ranking_id, is_public_visible, created_at, updated_at
    ) VALUES
        (event_past_id, '2024-06-15 09:00:00', cat_elite_id, gender_male_id, length_long_id, ranking_uci_id, true, NOW(), NOW()),
        (event_past_id, '2024-06-15 09:15:00', cat_elite_id, gender_female_id, length_long_id, ranking_uci_id, true, NOW(), NOW()),
        (event_past_id, '2024-06-15 10:00:00', cat_ma_id, gender_male_id, length_short_id, ranking_national_id, true, NOW(), NOW());

    -- Event 2 Races (Future Event - all public)
    INSERT INTO public.races (
        event_id, date_time, race_category_id, race_category_gender_id,
        race_category_length_id, race_ranking_id, is_public_visible, created_at, updated_at
    ) VALUES
        (event_future_id, '2025-09-20 08:00:00', cat_elite_id, gender_male_id, length_long_id, ranking_national_id, true, NOW(), NOW()),
        (event_future_id, '2025-09-20 08:15:00', cat_es_19_23_id, gender_open_id, length_short_id, ranking_regional_id, true, NOW(), NOW()),
        (event_future_id, '2025-09-20 09:00:00', cat_mb_id, gender_male_id, length_long_id, ranking_regional_id, true, NOW(), NOW());

    -- Event 3 Races (Draft Event - mixed visibility)
    INSERT INTO public.races (
        event_id, date_time, race_category_id, race_category_gender_id,
        race_category_length_id, race_ranking_id, is_public_visible, created_at, updated_at
    ) VALUES
        (event_draft_id, '2025-12-01 10:00:00', cat_elite_id, gender_male_id, length_long_id, ranking_custom_id, false, NOW(), NOW()),
        (event_draft_id, '2025-12-01 10:30:00', cat_ja_15_16_id, gender_open_id, length_short_id, ranking_custom_id, false, NOW(), NOW()),
        (event_draft_id, '2025-12-01 11:00:00', cat_ma_id, gender_female_id, length_short_id, ranking_custom_id, true, NOW(), NOW());

    -- Event 4 Races (Ongoing Event - all public)
    INSERT INTO public.races (
        event_id, date_time, race_category_id, race_category_gender_id,
        race_category_length_id, race_ranking_id, is_public_visible, created_at, updated_at
    ) VALUES
        (event_ongoing_id, '2025-03-15 09:30:00', cat_elite_id, gender_male_id, length_long_id, ranking_uci_id, true, NOW(), NOW()),
        (event_ongoing_id, '2025-03-15 09:45:00', cat_elite_id, gender_female_id, length_long_id, ranking_uci_id, true, NOW(), NOW()),
        (event_ongoing_id, '2025-03-15 11:00:00', cat_mb_id, gender_male_id, length_short_id, ranking_national_id, true, NOW(), NOW());

    -- =====================================================
    -- 13. CREATE RACE RESULTS (~60 total, ~5 per race)
    -- =====================================================
    RAISE NOTICE '- Creating race results...';

    -- Helper: Get race IDs for each event
    -- Event 1 - Race 1 (Elite Male Long UCI)
    SELECT id INTO race_id FROM public.races
    WHERE event_id = event_past_id AND race_category_id = cat_elite_id AND race_category_gender_id = gender_male_id
    LIMIT 1;

    INSERT INTO public.race_results (race_id, cyclist_id, place, time, ranking_point_id)
    VALUES
        (race_id, cyclist_linked1_id, 1, '02:45:30', uci_1st_id),
        (race_id, cyclist_unlinked5_id, 2, '02:46:15', uci_2nd_id),
        (race_id, cyclist_linked3_id, 3, '02:47:00', uci_3rd_id),
        (race_id, cyclist_unlinked1_id, 4, '02:48:20', (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_uci_id AND place = 4)),
        (race_id, cyclist_unlinked3_id, 5, '02:50:10', (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_uci_id AND place = 5));

    -- Event 1 - Race 2 (Elite Female Long UCI)
    SELECT id INTO race_id FROM public.races
    WHERE event_id = event_past_id AND race_category_id = cat_elite_id AND race_category_gender_id = gender_female_id
    LIMIT 1;

    INSERT INTO public.race_results (race_id, cyclist_id, place, time, ranking_point_id)
    VALUES
        (race_id, cyclist_linked2_id, 1, '03:10:45', uci_1st_id),
        (race_id, cyclist_unlinked2_id, 2, '03:12:30', uci_2nd_id),
        (race_id, cyclist_unlinked4_id, 3, '03:15:00', uci_3rd_id);

    -- Event 1 - Race 3 (MA Male Short National)
    SELECT id INTO race_id FROM public.races
    WHERE event_id = event_past_id AND race_category_id = cat_ma_id AND race_category_gender_id = gender_male_id
    LIMIT 1;

    INSERT INTO public.race_results (race_id, cyclist_id, place, time, ranking_point_id)
    VALUES
        (race_id, cyclist_unlinked5_id, 1, '01:30:15', national_1st_id),
        (race_id, cyclist_linked3_id, 2, '01:31:00', national_2nd_id),
        (race_id, cyclist_unlinked1_id, 3, '01:32:45', (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_national_id AND place = 3)),
        (race_id, cyclist_linked1_id, 4, '01:35:00', (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_national_id AND place = 4)),
        (race_id, cyclist_unlinked3_id, 5, '01:36:30', (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_national_id AND place = 5));

    -- Event 2 - Race 1 (Elite Male Long National)
    SELECT id INTO race_id FROM public.races
    WHERE event_id = event_future_id AND race_category_id = cat_elite_id AND race_category_gender_id = gender_male_id
    LIMIT 1;

    INSERT INTO public.race_results (race_id, cyclist_id, place, time, ranking_point_id)
    VALUES
        (race_id, cyclist_linked1_id, 1, NULL, national_1st_id),
        (race_id, cyclist_linked3_id, 2, NULL, national_2nd_id),
        (race_id, cyclist_unlinked5_id, 3, NULL, (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_national_id AND place = 3)),
        (race_id, cyclist_unlinked1_id, 4, NULL, (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_national_id AND place = 4)),
        (race_id, cyclist_unlinked3_id, 5, NULL, (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_national_id AND place = 5));

    -- Event 2 - Race 2 (ES_19_23 Open Short Regional)
    SELECT id INTO race_id FROM public.races
    WHERE event_id = event_future_id AND race_category_id = cat_es_19_23_id AND race_category_gender_id = gender_open_id
    LIMIT 1;

    INSERT INTO public.race_results (race_id, cyclist_id, place, time, ranking_point_id)
    VALUES
        (race_id, cyclist_unlinked3_id, 1, NULL, regional_1st_id),
        (race_id, cyclist_unlinked4_id, 2, NULL, (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_regional_id AND place = 2)),
        (race_id, cyclist_linked1_id, 3, NULL, (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_regional_id AND place = 3)),
        (race_id, cyclist_linked2_id, 4, NULL, (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_regional_id AND place = 4)),
        (race_id, cyclist_unlinked2_id, 5, NULL, (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_regional_id AND place = 5));

    -- Event 2 - Race 3 (MB Male Long Regional)
    SELECT id INTO race_id FROM public.races
    WHERE event_id = event_future_id AND race_category_id = cat_mb_id AND race_category_gender_id = gender_male_id
    LIMIT 1;

    INSERT INTO public.race_results (race_id, cyclist_id, place, time, ranking_point_id)
    VALUES
        (race_id, cyclist_unlinked5_id, 1, NULL, regional_1st_id),
        (race_id, cyclist_linked3_id, 2, NULL, (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_regional_id AND place = 2)),
        (race_id, cyclist_unlinked1_id, 3, NULL, (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_regional_id AND place = 3)),
        (race_id, cyclist_linked1_id, 4, NULL, (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_regional_id AND place = 4)),
        (race_id, cyclist_unlinked3_id, 5, NULL, (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_regional_id AND place = 5));

    -- Event 3 - Race 1 (Elite Male Long Custom) - PRIVATE RACE
    SELECT id INTO race_id FROM public.races
    WHERE event_id = event_draft_id AND race_category_id = cat_elite_id AND race_category_gender_id = gender_male_id
    LIMIT 1;

    INSERT INTO public.race_results (race_id, cyclist_id, place, time, ranking_point_id)
    VALUES
        (race_id, cyclist_linked1_id, 1, NULL, custom_1st_id),
        (race_id, cyclist_unlinked5_id, 2, NULL, (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_custom_id AND place = 2)),
        (race_id, cyclist_linked3_id, 3, NULL, (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_custom_id AND place = 3)),
        (race_id, cyclist_unlinked1_id, 4, NULL, (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_custom_id AND place = 4)),
        (race_id, cyclist_unlinked3_id, 5, NULL, (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_custom_id AND place = 5));

    -- Event 3 - Race 2 (JA_15_16 Open Short Custom) - PRIVATE RACE
    SELECT id INTO race_id FROM public.races
    WHERE event_id = event_draft_id AND race_category_id = cat_ja_15_16_id AND race_category_gender_id = gender_open_id
    LIMIT 1;

    INSERT INTO public.race_results (race_id, cyclist_id, place, time, ranking_point_id)
    VALUES
        (race_id, cyclist_unlinked3_id, 1, NULL, custom_1st_id),
        (race_id, cyclist_unlinked4_id, 2, NULL, (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_custom_id AND place = 2)),
        (race_id, cyclist_linked2_id, 3, NULL, (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_custom_id AND place = 3)),
        (race_id, cyclist_linked1_id, 4, NULL, (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_custom_id AND place = 4)),
        (race_id, cyclist_unlinked2_id, 5, NULL, (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_custom_id AND place = 5));

    -- Event 3 - Race 3 (MA Female Short Custom) - PUBLIC RACE in PRIVATE EVENT
    SELECT id INTO race_id FROM public.races
    WHERE event_id = event_draft_id AND race_category_id = cat_ma_id AND race_category_gender_id = gender_female_id
    LIMIT 1;

    INSERT INTO public.race_results (race_id, cyclist_id, place, time, ranking_point_id)
    VALUES
        (race_id, cyclist_linked2_id, 1, NULL, custom_1st_id),
        (race_id, cyclist_unlinked2_id, 2, NULL, (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_custom_id AND place = 2)),
        (race_id, cyclist_unlinked4_id, 3, NULL, (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_custom_id AND place = 3));

    -- Event 4 - Race 1 (Elite Male Long UCI) - ONGOING
    SELECT id INTO race_id FROM public.races
    WHERE event_id = event_ongoing_id AND race_category_id = cat_elite_id AND race_category_gender_id = gender_male_id
    LIMIT 1;

    INSERT INTO public.race_results (race_id, cyclist_id, place, time, ranking_point_id)
    VALUES
        (race_id, cyclist_linked1_id, 1, '02:52:15', uci_1st_id),
        (race_id, cyclist_linked3_id, 2, '02:53:00', uci_2nd_id),
        (race_id, cyclist_unlinked5_id, 3, '02:54:30', uci_3rd_id),
        (race_id, cyclist_unlinked1_id, 4, '02:56:00', (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_uci_id AND place = 4)),
        (race_id, cyclist_unlinked3_id, 5, '02:58:45', (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_uci_id AND place = 5));

    -- Event 4 - Race 2 (Elite Female Long UCI) - ONGOING
    SELECT id INTO race_id FROM public.races
    WHERE event_id = event_ongoing_id AND race_category_id = cat_elite_id AND race_category_gender_id = gender_female_id
    LIMIT 1;

    INSERT INTO public.race_results (race_id, cyclist_id, place, time, ranking_point_id)
    VALUES
        (race_id, cyclist_linked2_id, 1, '03:15:20', uci_1st_id),
        (race_id, cyclist_unlinked2_id, 2, '03:17:45', uci_2nd_id),
        (race_id, cyclist_unlinked4_id, 3, '03:20:10', uci_3rd_id);

    -- Event 4 - Race 3 (MB Male Short National) - ONGOING
    SELECT id INTO race_id FROM public.races
    WHERE event_id = event_ongoing_id AND race_category_id = cat_mb_id AND race_category_gender_id = gender_male_id
    LIMIT 1;

    INSERT INTO public.race_results (race_id, cyclist_id, place, time, ranking_point_id)
    VALUES
        (race_id, cyclist_unlinked5_id, 1, '01:25:30', national_1st_id),
        (race_id, cyclist_linked3_id, 2, '01:26:15', national_2nd_id),
        (race_id, cyclist_unlinked1_id, 3, '01:27:50', (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_national_id AND place = 3)),
        (race_id, cyclist_linked1_id, 4, '01:29:00', (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_national_id AND place = 4)),
        (race_id, cyclist_unlinked3_id, 5, '01:30:45', (SELECT id FROM ranking_points WHERE race_ranking_id = ranking_national_id AND place = 5));

    RAISE NOTICE '✅ Test seed data created successfully!';
    RAISE NOTICE '   - 2 Organizations';
    RAISE NOTICE '   - 5 Test Users (organizer, staff, 3 cyclists)';
    RAISE NOTICE '   - 8 Cyclists total (3 linked, 5 unlinked)';
    RAISE NOTICE '   - 4 Events (past, future, draft, ongoing)';
    RAISE NOTICE '   - 12 Races (3 per event)';
    RAISE NOTICE '   - ~60 Race Results';
    RAISE NOTICE '   - All 4 Ranking Systems with points';

END $$;

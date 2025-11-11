-- =====================================================
-- SEED DATA: User-Independent Data Only
-- =====================================================
-- This file contains ONLY user-independent data:
--   - Organizations
--   - Unlinked cyclists (cyclists without user accounts)
--   - Ranking points
--
-- IMPORTANT: All user-dependent data is created by seed-users.ts:
--   - Users and their profiles
--   - Events (requires created_by user field)
--   - Races (requires events)
--   - Race results (requires users and cyclists)
--
-- WORKFLOW:
--   1. Run: supabase db reset --linked --yes  (runs migrations + this seed.sql)
--   2. Run: npm run seed:users                (creates users + events + races + results)
-- =====================================================

DO $$
DECLARE
    -- Organization IDs
    org_pro_league_id UUID;
    org_valencia_fed_id UUID;

    -- Ranking IDs
    ranking_uci_id UUID;
    ranking_national_id UUID;
    ranking_regional_id UUID;
    ranking_custom_id UUID;

BEGIN
    RAISE NOTICE 'Starting user-independent seed data creation...';
    RAISE NOTICE '';

    -- =====================================================
    -- 1. CREATE ORGANIZATIONS
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
    -- 2. GET RANKING IDs
    -- =====================================================
    SELECT id INTO ranking_uci_id FROM public.race_rankings WHERE name = 'UCI' LIMIT 1;
    SELECT id INTO ranking_national_id FROM public.race_rankings WHERE name = 'NATIONAL' LIMIT 1;
    SELECT id INTO ranking_regional_id FROM public.race_rankings WHERE name = 'REGIONAL' LIMIT 1;
    SELECT id INTO ranking_custom_id FROM public.race_rankings WHERE name = 'CUSTOM' LIMIT 1;

    -- =====================================================
    -- 3. CREATE RANKING POINTS
    -- =====================================================
    RAISE NOTICE '- Creating ranking points for all ranking systems...';

    -- UCI Points (top 10)
    INSERT INTO public.ranking_points (race_ranking_id, place, points)
    VALUES
        (ranking_uci_id, 1, 100),
        (ranking_uci_id, 2, 80),
        (ranking_uci_id, 3, 70),
        (ranking_uci_id, 4, 60),
        (ranking_uci_id, 5, 50),
        (ranking_uci_id, 6, 40),
        (ranking_uci_id, 7, 35),
        (ranking_uci_id, 8, 30),
        (ranking_uci_id, 9, 25),
        (ranking_uci_id, 10, 20);

    -- National Points (top 10)
    INSERT INTO public.ranking_points (race_ranking_id, place, points)
    VALUES
        (ranking_national_id, 1, 50),
        (ranking_national_id, 2, 40),
        (ranking_national_id, 3, 35),
        (ranking_national_id, 4, 30),
        (ranking_national_id, 5, 25),
        (ranking_national_id, 6, 20),
        (ranking_national_id, 7, 18),
        (ranking_national_id, 8, 16),
        (ranking_national_id, 9, 14),
        (ranking_national_id, 10, 12);

    -- Regional Points (top 10)
    INSERT INTO public.ranking_points (race_ranking_id, place, points)
    VALUES
        (ranking_regional_id, 1, 25),
        (ranking_regional_id, 2, 20),
        (ranking_regional_id, 3, 18),
        (ranking_regional_id, 4, 16),
        (ranking_regional_id, 5, 14),
        (ranking_regional_id, 6, 12),
        (ranking_regional_id, 7, 10),
        (ranking_regional_id, 8, 8),
        (ranking_regional_id, 9, 6),
        (ranking_regional_id, 10, 4);

    -- Custom Points (top 5)
    INSERT INTO public.ranking_points (race_ranking_id, place, points)
    VALUES
        (ranking_custom_id, 1, 10),
        (ranking_custom_id, 2, 8),
        (ranking_custom_id, 3, 6),
        (ranking_custom_id, 4, 4),
        (ranking_custom_id, 5, 2);

    -- =====================================================
    -- SEEDING COMPLETE
    -- =====================================================
    RAISE NOTICE '';
    RAISE NOTICE '✅ User-independent seed data created successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Data Created:';
    RAISE NOTICE '   - 2 Organizations';
    RAISE NOTICE '   - All 4 Ranking Systems with points (~38 total)';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  NEXT STEP: Run "npm run seed:users"';
    RAISE NOTICE '   This will create:';
    RAISE NOTICE '     - 6 Registered users (admin, organizer, staff, 3 cyclists)';
    RAISE NOTICE '     - 45 Anonymous cyclists (no auth accounts)';
    RAISE NOTICE '     - 4 Events (past, future, draft, ongoing)';
    RAISE NOTICE '     - 12 Races (3 per event)';
    RAISE NOTICE '     - ~54 Race Results';
    RAISE NOTICE '';

END $$;

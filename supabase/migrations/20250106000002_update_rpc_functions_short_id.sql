-- Migration: Update RPC Functions to Accept short_id Parameters
-- Purpose: Enable RPC functions to work with short_id while using UUID internally
-- Architecture: Accept short_id → lookup UUID → use UUID for joins → return short_id

-- ============================================================================
-- SECTION 1: Update get_cyclist_with_results Function
-- ============================================================================
-- Changed parameter from cyclist_uuid UUID to cyclist_short_id TEXT
-- Internal: Lookup UUID from short_id, use UUID for joins, return short_id in response

-- Drop the old function signature (UUID parameter)
DROP FUNCTION IF EXISTS public.get_cyclist_with_results(UUID);

CREATE OR REPLACE FUNCTION public.get_cyclist_with_results(cyclist_short_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  cyclist_uuid UUID;
BEGIN
  -- Lookup UUID from short_id
  SELECT id INTO cyclist_uuid
  FROM public.cyclists
  WHERE short_id = cyclist_short_id;

  -- Return NULL if cyclist doesn't exist
  IF cyclist_uuid IS NULL THEN
    RETURN NULL;
  END IF;

  -- Build the cyclist object with nested race_results
  -- Note: Returns short_id as 'id' field (domain abstraction)
  SELECT jsonb_build_object(
    'id', c.short_id,  -- Changed: Return short_id instead of UUID
    'name', c.name,
    'last_name', c.last_name,
    'born_year', c.born_year,
    'gender_id', c.gender_id,
    'user_id', c.user_id,
    'created_at', c.created_at,
    'updated_at', c.updated_at,
    'gender', CASE
      WHEN c.gender_id IS NOT NULL THEN (
        SELECT jsonb_build_object(
          'id', cg.short_id,  -- Changed: Return short_id
          'name', cg.name,
          'created_at', cg.created_at,
          'updated_at', cg.updated_at
        )
        FROM public.cyclist_genders cg
        WHERE cg.id = c.gender_id  -- Internal join uses UUID
      )
      ELSE NULL
    END,
    'race_results', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', rr.short_id,  -- Changed: Return short_id
          'place', rr.place,
          'time', rr.time,
          'cyclist_id', c_inner.short_id,  -- Changed: Return short_id
          'race_id', r.short_id,  -- Changed: Return short_id
          'ranking_point_id', rp_ref.short_id,  -- Changed: Return short_id
          'created_at', rr.created_at,
          'updated_at', rr.updated_at,
          'race', jsonb_build_object(
            'id', r.short_id,  -- Changed: Return short_id
            'name', r.name,
            'description', r.description,
            'date_time', r.date_time,
            'is_public_visible', r.is_public_visible,
            'event_id', e.short_id,  -- Changed: Return short_id
            'race_category_id', rc.short_id,  -- Changed: Return short_id
            'race_category_gender_id', rcg.short_id,  -- Changed: Return short_id
            'race_category_length_id', rcl.short_id,  -- Changed: Return short_id
            'race_ranking_id', rrank.short_id,  -- Changed: Return short_id
            'created_at', r.created_at,
            'updated_at', r.updated_at,
            'event', jsonb_build_object(
              'id', e.short_id,  -- Changed: Return short_id
              'name', e.name,
              'description', e.description,
              'date_time', e.date_time,
              'city', e.city,
              'state', e.state,
              'country', e.country,
              'year', e.year,
              'event_status', e.event_status,
              'is_public_visible', e.is_public_visible,
              'organization_id', e.organization_id,
              'created_by', e.created_by,
              'created_at', e.created_at,
              'updated_at', e.updated_at
            ),
            'race_category', jsonb_build_object(
              'id', rc.short_id,  -- Changed: Return short_id
              'name', rc.name,
              'created_at', rc.created_at,
              'updated_at', rc.updated_at
            ),
            'race_category_gender', jsonb_build_object(
              'id', rcg.short_id,  -- Changed: Return short_id
              'name', rcg.name,
              'created_at', rcg.created_at,
              'updated_at', rcg.updated_at
            ),
            'race_category_length', jsonb_build_object(
              'id', rcl.short_id,  -- Changed: Return short_id
              'name', rcl.name,
              'created_at', rcl.created_at,
              'updated_at', rcl.updated_at
            ),
            'race_ranking', jsonb_build_object(
              'id', rrank.short_id,  -- Changed: Return short_id
              'name', rrank.name,
              'created_at', rrank.created_at,
              'updated_at', rrank.updated_at
            )
          ),
          'ranking_point', CASE
            WHEN rr.ranking_point_id IS NOT NULL THEN (
              SELECT jsonb_build_object(
                'id', rp.short_id,  -- Changed: Return short_id
                'place', rp.place,
                'points', rp.points,
                'race_ranking_id', rp_rank.short_id,  -- Changed: Return short_id
                'created_at', rp.created_at,
                'updated_at', rp.updated_at
              )
              FROM public.ranking_points rp
              LEFT JOIN public.race_rankings rp_rank ON rp.race_ranking_id = rp_rank.id
              WHERE rp.id = rr.ranking_point_id  -- Internal join uses UUID
            )
            ELSE NULL
          END
        )
        ORDER BY e.date_time DESC  -- Most recent events first
      ), '[]'::jsonb)
      FROM public.race_results rr
      JOIN public.races r ON rr.race_id = r.id  -- Internal join uses UUID
      JOIN public.events e ON r.event_id = e.id  -- Internal join uses UUID
      JOIN public.race_categories rc ON r.race_category_id = rc.id
      JOIN public.race_category_genders rcg ON r.race_category_gender_id = rcg.id
      JOIN public.race_category_lengths rcl ON r.race_category_length_id = rcl.id
      JOIN public.race_rankings rrank ON r.race_ranking_id = rrank.id
      JOIN public.cyclists c_inner ON rr.cyclist_id = c_inner.id
      LEFT JOIN public.ranking_points rp_ref ON rr.ranking_point_id = rp_ref.id
      WHERE rr.cyclist_id = cyclist_uuid  -- Filter uses UUID (from lookup)
    )
  ) INTO result
  FROM public.cyclists c
  WHERE c.id = cyclist_uuid;  -- Uses UUID for main query

  RETURN result;
END;
$$;

COMMENT ON FUNCTION public.get_cyclist_with_results IS 'Returns enriched cyclist data with nested race results. Accepts short_id parameter, uses UUID internally for performance, returns short_id in all response fields. Results sorted by event date (most recent first).';

-- ============================================================================
-- SECTION 2: Update get_user_with_relations Function
-- ============================================================================
-- Changed parameter from user_uuid UUID to user_short_id TEXT (optional)
-- Internal: Lookup UUID from short_id or use auth.uid(), use UUID for joins, return short_id

-- Drop the old function signature (UUID parameter)
DROP FUNCTION IF EXISTS public.get_user_with_relations(UUID);
DROP FUNCTION IF EXISTS public.get_user_with_relations();

CREATE OR REPLACE FUNCTION public.get_user_with_relations(user_short_id TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  target_user_uuid UUID;
  user_role_name TEXT;
BEGIN
  -- If short_id provided, lookup UUID
  IF user_short_id IS NOT NULL THEN
    SELECT id INTO target_user_uuid
    FROM public.users
    WHERE short_id = user_short_id;
  ELSE
    -- Otherwise, use authenticated user's UUID
    target_user_uuid := auth.uid();
  END IF;

  -- Return NULL if no user ID available
  IF target_user_uuid IS NULL THEN
    RETURN NULL;
  END IF;

  -- Get the user's role name for conditional logic
  SELECT r.name INTO user_role_name
  FROM public.users u
  JOIN public.roles r ON u.role_id = r.id
  WHERE u.id = target_user_uuid;

  -- Return NULL if user not found
  IF user_role_name IS NULL THEN
    RETURN NULL;
  END IF;

  -- Build the base user object with role
  -- Note: Returns short_id as 'id' field (domain abstraction)
  SELECT jsonb_build_object(
    'id', u.short_id,  -- Changed: Return short_id instead of UUID
    'username', u.username,
    'role_id', r.short_id,  -- Changed: Return short_id
    'created_at', u.created_at,
    'updated_at', u.updated_at,
    'role', jsonb_build_object(
      'id', r.short_id,  -- Changed: Return short_id
      'name', r.name,
      'created_at', r.created_at,
      'updated_at', r.updated_at
    ),
    'cyclist', CASE
      WHEN r.name = 'cyclist' THEN (
        SELECT jsonb_build_object(
          'id', c.short_id,  -- Changed: Return short_id
          'user_id', u_ref.short_id,  -- Changed: Return short_id
          'name', c.name,
          'last_name', c.last_name,
          'born_year', c.born_year,
          'gender_id', cg_ref.short_id,  -- Changed: Return short_id
          'created_at', c.created_at,
          'updated_at', c.updated_at
        )
        FROM public.cyclists c
        LEFT JOIN public.users u_ref ON c.user_id = u_ref.id
        LEFT JOIN public.cyclist_genders cg_ref ON c.gender_id = cg_ref.id
        WHERE c.user_id = u.id  -- Internal join uses UUID
        LIMIT 1
      )
      ELSE NULL
    END,
    'organizer', CASE
      WHEN r.name IN ('organizer_staff', 'organizer') THEN (
        SELECT jsonb_build_object(
          'id', o.short_id,  -- Changed: Return short_id
          'user_id', u_ref2.short_id,  -- Changed: Return short_id
          'organization_id', o.organization_id,
          'created_at', o.created_at,
          'updated_at', o.updated_at,
          'organization', (
            SELECT jsonb_build_object(
              'id', org.short_id,  -- Changed: Return short_id
              'name', org.name,
              'description', org.description,
              'created_at', org.created_at,
              'updated_at', org.updated_at
            )
            FROM public.organizations org
            WHERE org.id = o.organization_id  -- Internal join uses UUID
          )
        )
        FROM public.organizers o
        LEFT JOIN public.users u_ref2 ON o.user_id = u_ref2.id
        WHERE o.user_id = u.id  -- Internal join uses UUID
        LIMIT 1
      )
      ELSE NULL
    END
  ) INTO result
  FROM public.users u
  JOIN public.roles r ON u.role_id = r.id
  WHERE u.id = target_user_uuid;  -- Uses UUID for main query

  RETURN result;
END;
$$;

COMMENT ON FUNCTION public.get_user_with_relations IS 'Returns enriched user data with role and related entities (cyclist or organizer). Accepts optional short_id parameter (defaults to authenticated user). Uses UUID internally, returns short_id in all response fields.';

-- ============================================================================
-- SECTION 3: Summary
-- ============================================================================
-- Updated RPC Functions (2 total):
-- ✓ get_cyclist_with_results: Now accepts short_id TEXT parameter
-- ✓ get_user_with_relations: Now accepts optional short_id TEXT parameter
--
-- Architecture:
-- 1. Accept short_id as TEXT parameter (public API)
-- 2. Lookup UUID from short_id at function start
-- 3. Use UUID for all internal JOINs (performance - indexed UUID PKs)
-- 4. Return short_id in all JSON response fields (domain abstraction)
--
-- Benefits:
-- - Application layer never sees UUID
-- - Database uses UUID for fast joins
-- - Public API uses clean short_id
-- - Translation happens at DB boundary (closest to data)
-- ============================================================================

-- Migration: Fix RPC Functions to Return short_id Field (Not Renamed to id)
-- Purpose: Keep RPC responses consistent with DB schema
-- Adapters will handle short_id → id translation (single responsibility)

-- ============================================================================
-- Fix get_cyclist_with_results to return short_id as short_id (not as id)
-- ============================================================================

DROP FUNCTION IF EXISTS public.get_cyclist_with_results(TEXT);

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
  -- IMPORTANT: Return short_id as 'short_id' (NOT as 'id')
  -- Adapters will translate short_id → id for domain layer
  SELECT jsonb_build_object(
    'id', c.id,  -- Return UUID as 'id' (for FK references if needed)
    'short_id', c.short_id,  -- Return short_id as 'short_id'
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
          'id', cg.id,
          'short_id', cg.short_id,
          'name', cg.name,
          'created_at', cg.created_at,
          'updated_at', cg.updated_at
        )
        FROM public.cyclist_genders cg
        WHERE cg.id = c.gender_id
      )
      ELSE NULL
    END,
    'race_results', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', rr.id,
          'short_id', rr.short_id,
          'place', rr.place,
          'time', rr.time,
          'cyclist_id', c.id,
          'race_id', r.id,
          'ranking_point_id', rr.ranking_point_id,
          'created_at', rr.created_at,
          'updated_at', rr.updated_at,
          'race', jsonb_build_object(
            'id', r.id,
            'short_id', r.short_id,
            'name', r.name,
            'description', r.description,
            'date_time', r.date_time,
            'is_public_visible', r.is_public_visible,
            'event_id', r.event_id,
            'race_category_id', r.race_category_id,
            'race_category_gender_id', r.race_category_gender_id,
            'race_category_length_id', r.race_category_length_id,
            'race_ranking_id', r.race_ranking_id,
            'created_at', r.created_at,
            'updated_at', r.updated_at,
            'event', jsonb_build_object(
              'id', e.id,
              'short_id', e.short_id,
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
              'id', rc.id,
              'short_id', rc.short_id,
              'name', rc.name,
              'created_at', rc.created_at,
              'updated_at', rc.updated_at
            ),
            'race_category_gender', jsonb_build_object(
              'id', rcg.id,
              'short_id', rcg.short_id,
              'name', rcg.name,
              'created_at', rcg.created_at,
              'updated_at', rcg.updated_at
            ),
            'race_category_length', jsonb_build_object(
              'id', rcl.id,
              'short_id', rcl.short_id,
              'name', rcl.name,
              'created_at', rcl.created_at,
              'updated_at', rcl.updated_at
            ),
            'race_ranking', jsonb_build_object(
              'id', rrank.id,
              'short_id', rrank.short_id,
              'name', rrank.name,
              'created_at', rrank.created_at,
              'updated_at', rrank.updated_at
            )
          ),
          'ranking_point', CASE
            WHEN rr.ranking_point_id IS NOT NULL THEN (
              SELECT jsonb_build_object(
                'id', rp.id,
                'short_id', rp.short_id,
                'place', rp.place,
                'points', rp.points,
                'race_ranking_id', rp.race_ranking_id,
                'created_at', rp.created_at,
                'updated_at', rp.updated_at
              )
              FROM public.ranking_points rp
              WHERE rp.id = rr.ranking_point_id
            )
            ELSE NULL
          END
        )
        ORDER BY e.date_time DESC
      ), '[]'::jsonb)
      FROM public.race_results rr
      JOIN public.races r ON rr.race_id = r.id
      JOIN public.events e ON r.event_id = e.id
      JOIN public.race_categories rc ON r.race_category_id = rc.id
      JOIN public.race_category_genders rcg ON r.race_category_gender_id = rcg.id
      JOIN public.race_category_lengths rcl ON r.race_category_length_id = rcl.id
      JOIN public.race_rankings rrank ON r.race_ranking_id = rrank.id
      WHERE rr.cyclist_id = cyclist_uuid
    )
  ) INTO result
  FROM public.cyclists c
  WHERE c.id = cyclist_uuid;

  RETURN result;
END;
$$;

COMMENT ON FUNCTION public.get_cyclist_with_results IS 'Returns enriched cyclist data with nested race results. Accepts short_id parameter, returns short_id fields (adapters translate to domain). Results sorted by event date (most recent first).';

-- ============================================================================
-- Fix get_user_with_relations to return short_id as short_id
-- ============================================================================

DROP FUNCTION IF EXISTS public.get_user_with_relations(TEXT);
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
  -- IMPORTANT: Return short_id as 'short_id' (NOT as 'id')
  SELECT jsonb_build_object(
    'id', u.id,
    'short_id', u.short_id,
    'username', u.username,
    'role_id', u.role_id,
    'created_at', u.created_at,
    'updated_at', u.updated_at,
    'role', jsonb_build_object(
      'id', r.id,
      'short_id', r.short_id,
      'name', r.name,
      'created_at', r.created_at,
      'updated_at', r.updated_at
    ),
    'cyclist', CASE
      WHEN r.name = 'cyclist' THEN (
        SELECT jsonb_build_object(
          'id', c.id,
          'short_id', c.short_id,
          'user_id', c.user_id,
          'name', c.name,
          'last_name', c.last_name,
          'born_year', c.born_year,
          'gender_id', c.gender_id,
          'created_at', c.created_at,
          'updated_at', c.updated_at
        )
        FROM public.cyclists c
        WHERE c.user_id = u.id
        LIMIT 1
      )
      ELSE NULL
    END,
    'organizer', CASE
      WHEN r.name IN ('organizer_staff', 'organizer') THEN (
        SELECT jsonb_build_object(
          'id', o.id,
          'short_id', o.short_id,
          'user_id', o.user_id,
          'organization_id', o.organization_id,
          'created_at', o.created_at,
          'updated_at', o.updated_at,
          'organization', (
            SELECT jsonb_build_object(
              'id', org.id,
              'short_id', org.short_id,
              'name', org.name,
              'description', org.description,
              'created_at', org.created_at,
              'updated_at', org.updated_at
            )
            FROM public.organizations org
            WHERE org.id = o.organization_id
          )
        )
        FROM public.organizers o
        WHERE o.user_id = u.id
        LIMIT 1
      )
      ELSE NULL
    END
  ) INTO result
  FROM public.users u
  JOIN public.roles r ON u.role_id = r.id
  WHERE u.id = target_user_uuid;

  RETURN result;
END;
$$;

COMMENT ON FUNCTION public.get_user_with_relations IS 'Returns enriched user data with role and related entities. Accepts optional short_id parameter (defaults to authenticated user). Returns short_id fields (adapters translate to domain).';

-- ============================================================================
-- Summary
-- ============================================================================
-- Fixed RPC functions to return short_id as 'short_id' field (not renamed to 'id')
-- This keeps RPC responses consistent with DB schema
-- Adapters handle the short_id → id translation for domain layer
-- ============================================================================

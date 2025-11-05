-- =====================================================
-- Migration 07: Cyclist RPC Functions
-- =====================================================
-- Creates RPC function for optimized cyclist data retrieval
-- with nested race results and related entities
-- =====================================================

-- =====================================================
-- SECTION 1: Get Cyclist With Results Function
-- =====================================================
-- Returns enriched cyclist data with race results array
-- Each result includes full race details (event, categories, ranking)

CREATE OR REPLACE FUNCTION public.get_cyclist_with_results(cyclist_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Return NULL if cyclist doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.cyclists WHERE id = cyclist_uuid) THEN
    RETURN NULL;
  END IF;

  -- Build the cyclist object with nested race_results
  SELECT jsonb_build_object(
    'id', c.id,
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
          'place', rr.place,
          'time', rr.time,
          'cyclist_id', rr.cyclist_id,
          'race_id', rr.race_id,
          'ranking_point_id', rr.ranking_point_id,
          'created_at', rr.created_at,
          'updated_at', rr.updated_at,
          'race', jsonb_build_object(
            'id', r.id,
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
              'name', rc.name,
              'created_at', rc.created_at,
              'updated_at', rc.updated_at
            ),
            'race_category_gender', jsonb_build_object(
              'id', rcg.id,
              'name', rcg.name,
              'created_at', rcg.created_at,
              'updated_at', rcg.updated_at
            ),
            'race_category_length', jsonb_build_object(
              'id', rcl.id,
              'name', rcl.name,
              'created_at', rcl.created_at,
              'updated_at', rcl.updated_at
            ),
            'race_ranking', jsonb_build_object(
              'id', rrank.id,
              'name', rrank.name,
              'created_at', rrank.created_at,
              'updated_at', rrank.updated_at
            )
          ),
          'ranking_point', CASE
            WHEN rr.ranking_point_id IS NOT NULL THEN (
              SELECT jsonb_build_object(
                'id', rp.id,
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
        ORDER BY e.date_time DESC  -- Most recent events first
      ), '[]'::jsonb)
      FROM public.race_results rr
      JOIN public.races r ON rr.race_id = r.id
      JOIN public.events e ON r.event_id = e.id
      JOIN public.race_categories rc ON r.race_category_id = rc.id
      JOIN public.race_category_genders rcg ON r.race_category_gender_id = rcg.id
      JOIN public.race_category_lengths rcl ON r.race_category_length_id = rcl.id
      JOIN public.race_rankings rrank ON r.race_ranking_id = rrank.id
      WHERE rr.cyclist_id = c.id
    )
  ) INTO result
  FROM public.cyclists c
  WHERE c.id = cyclist_uuid;

  RETURN result;
END;
$$;

-- Add comment
COMMENT ON FUNCTION public.get_cyclist_with_results IS 'Returns enriched cyclist data with nested race results array. Each result includes full race details (event, categories, gender, length, ranking) and ranking points. Results are sorted by event date (most recent first).';

-- =====================================================
-- END OF MIGRATION 07
-- =====================================================

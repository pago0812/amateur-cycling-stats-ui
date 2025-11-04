-- =====================================================
-- Migration 06: Utility Functions
-- =====================================================
-- Creates RPC functions for enriched data retrieval
-- =====================================================

-- =====================================================
-- SECTION 1: Get User With Relations Function
-- =====================================================
-- Returns enriched user data with role and related entities
-- (cyclist profile or organizer profile with organization)

CREATE OR REPLACE FUNCTION public.get_user_with_relations(user_uuid UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  target_user_id UUID;
  user_role_name TEXT;
BEGIN
  -- If no UUID provided, use the authenticated user's ID
  target_user_id := COALESCE(user_uuid, auth.uid());

  -- Return NULL if no user ID available
  IF target_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Get the user's role name for conditional logic
  SELECT r.name INTO user_role_name
  FROM public.users u
  JOIN public.roles r ON u.role_id = r.id
  WHERE u.id = target_user_id;

  -- Return NULL if user not found
  IF user_role_name IS NULL THEN
    RETURN NULL;
  END IF;

  -- Build the base user object with role
  SELECT jsonb_build_object(
    'id', u.id,
    'username', u.username,
    'role_id', u.role_id,
    'created_at', u.created_at,
    'updated_at', u.updated_at,
    'role', jsonb_build_object(
      'id', r.id,
      'name', r.name,
      'created_at', r.created_at,
      'updated_at', r.updated_at
    ),
    'cyclist', CASE
      WHEN r.name = 'cyclist' THEN (
        SELECT jsonb_build_object(
          'id', c.id,
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
          'user_id', o.user_id,
          'organization_id', o.organization_id,
          'created_at', o.created_at,
          'updated_at', o.updated_at,
          'organization', (
            SELECT jsonb_build_object(
              'id', org.id,
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
  WHERE u.id = target_user_id;

  RETURN result;
END;
$$;

-- Add comment
COMMENT ON FUNCTION public.get_user_with_relations IS 'Returns enriched user data with role and related entities (cyclist or organizer with organization). If no UUID provided, returns data for the authenticated user.';

-- =====================================================
-- END OF MIGRATION 06
-- =====================================================

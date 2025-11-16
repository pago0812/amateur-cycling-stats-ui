-- =====================================================
-- Consolidated Migration 04: Session & Email Improvements
-- =====================================================
-- Consolidates: Email field + session validation + error code fix
-- Adds email, display_name, and session validation to get_auth_user RPC
-- =====================================================

-- =====================================================
-- SECTION 1: Update get_auth_user with Email and Session Validation
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_auth_user(user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  target_user_id UUID;
  user_role_name TEXT;
  user_email TEXT;
  user_display_name TEXT;
  current_auth_id UUID;
BEGIN
  -- If user_id provided, use it directly
  IF user_id IS NOT NULL THEN
    target_user_id := user_id;
  ELSE
    -- Validate session exists
    current_auth_id := auth.uid();

    IF current_auth_id IS NULL THEN
      RAISE EXCEPTION 'No active session found. Authentication required.'
        USING ERRCODE = '28000';  -- invalid_authorization_specification
    END IF;

    -- Use authenticated user's auth.uid() to find their public user ID
    SELECT id INTO target_user_id
    FROM public.users
    WHERE auth_user_id = current_auth_id
    LIMIT 1;
  END IF;

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

  -- Get email and display_name from auth.users table
  SELECT au.email, au.raw_user_meta_data->>'display_name'
  INTO user_email, user_display_name
  FROM public.users u
  LEFT JOIN auth.users au ON u.auth_user_id = au.id
  WHERE u.id = target_user_id;

  -- Build the base user object with role, email, and display_name
  SELECT jsonb_build_object(
    'id', u.id,
    'first_name', u.first_name,
    'last_name', u.last_name,
    'email', user_email,
    'display_name', user_display_name,
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
      WHEN r.name = 'CYCLIST'::role_name_enum THEN (
        SELECT jsonb_build_object(
          'id', c.id,
          'user_id', u.id,
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
      WHEN r.name IN ('ORGANIZER_STAFF'::role_name_enum, 'ORGANIZER_OWNER'::role_name_enum) THEN (
        SELECT jsonb_build_object(
          'id', o.id,
          'user_id', u.id,
          'organization_id', o.organization_id,
          'created_at', o.created_at,
          'updated_at', o.updated_at,
          'organization', (
            SELECT jsonb_build_object(
              'id', org.id,
              'name', org.name,
              'description', org.description,
              'state', org.state,
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

COMMENT ON FUNCTION public.get_auth_user(UUID) IS 'Returns enriched user data with first_name, last_name, email, display_name (from auth.users), role, and related entities (cyclist or organizer with organization). If no user_id provided, validates active session and returns data for the authenticated user. Raises exception with error code 28000 if no active session exists.';

-- =====================================================
-- END OF CONSOLIDATED MIGRATION 04
-- =====================================================

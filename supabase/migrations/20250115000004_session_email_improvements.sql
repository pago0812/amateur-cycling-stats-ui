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
RETURNS TABLE (
  id UUID,
  auth_user_id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  display_name TEXT,
  role_id UUID,
  role_name role_name_enum,
  cyclist_id UUID,
  cyclist_born_year INT,
  cyclist_gender_id UUID,
  cyclist_gender_name TEXT,
  organizer_id UUID,
  organization_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
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

  -- Return empty set if no user ID available
  IF target_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Get the user's role name for conditional logic
  SELECT r.name INTO user_role_name
  FROM public.users u
  JOIN public.roles r ON u.role_id = r.id
  WHERE u.id = target_user_id;

  -- Return empty set if user not found
  IF user_role_name IS NULL THEN
    RETURN;
  END IF;

  -- Get email and display_name from auth.users table
  SELECT au.email, au.raw_user_meta_data->>'display_name'
  INTO user_email, user_display_name
  FROM public.users u
  LEFT JOIN auth.users au ON u.auth_user_id = au.id
  WHERE u.id = target_user_id;

  -- Return flat user object with all fields at top level
  RETURN QUERY
  SELECT
    u.id,
    u.auth_user_id,
    u.first_name,
    u.last_name,
    user_email,
    user_display_name,
    u.role_id,
    r.name,
    c.id,
    c.born_year,
    c.gender_id,
    cg.name,
    o.id,
    o.organization_id,
    u.created_at,
    u.updated_at
  FROM public.users u
  JOIN public.roles r ON u.role_id = r.id
  LEFT JOIN public.cyclists c ON c.user_id = u.id AND r.name = 'CYCLIST'::role_name_enum
  LEFT JOIN public.cyclist_genders cg ON c.gender_id = cg.id
  LEFT JOIN public.organizers o ON o.user_id = u.id AND r.name IN ('ORGANIZER_STAFF'::role_name_enum, 'ORGANIZER_OWNER'::role_name_enum)
  WHERE u.id = target_user_id;
END;
$$;

COMMENT ON FUNCTION public.get_auth_user(UUID) IS 'Returns enriched user data as a TABLE row with flattened structure including first_name, last_name, email, display_name (from auth.users), role_name, and role-specific fields (cyclist_id, cyclist_born_year, cyclist_gender_id, cyclist_gender_name, organizer_id, organization_id). If no user_id provided, validates active session and returns data for the authenticated user. Raises exception with error code 28000 if no active session exists.';

-- =====================================================
-- SECTION 2: Add get_auth_user_by_email RPC
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_auth_user_by_email(p_email TEXT)
RETURNS TABLE (
  id UUID,
  auth_user_id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  display_name TEXT,
  role_id UUID,
  role_name role_name_enum,
  cyclist_id UUID,
  cyclist_born_year INT,
  cyclist_gender_id UUID,
  cyclist_gender_name TEXT,
  organizer_id UUID,
  organization_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
  user_role_name TEXT;
  user_email TEXT;
  user_display_name TEXT;
  target_auth_user_id UUID;
BEGIN
  -- Find auth user by email
  SELECT au.id, au.email, au.raw_user_meta_data->>'display_name'
  INTO target_auth_user_id, user_email, user_display_name
  FROM auth.users au
  WHERE au.email = p_email
  LIMIT 1;

  -- Return empty set if auth user not found
  IF target_auth_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Find public user by auth_user_id
  SELECT id INTO target_user_id
  FROM public.users
  WHERE auth_user_id = target_auth_user_id
  LIMIT 1;

  -- Return empty set if public user not found
  IF target_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Get the user's role name for conditional logic
  SELECT r.name INTO user_role_name
  FROM public.users u
  JOIN public.roles r ON u.role_id = r.id
  WHERE u.id = target_user_id;

  -- Return empty set if user not found
  IF user_role_name IS NULL THEN
    RETURN;
  END IF;

  -- Return flat user object with all fields at top level
  RETURN QUERY
  SELECT
    u.id,
    target_auth_user_id,
    u.first_name,
    u.last_name,
    user_email,
    user_display_name,
    u.role_id,
    r.name,
    c.id,
    c.born_year,
    c.gender_id,
    cg.name,
    o.id,
    o.organization_id,
    u.created_at,
    u.updated_at
  FROM public.users u
  JOIN public.roles r ON u.role_id = r.id
  LEFT JOIN public.cyclists c ON c.user_id = u.id AND r.name = 'CYCLIST'::role_name_enum
  LEFT JOIN public.cyclist_genders cg ON c.gender_id = cg.id
  LEFT JOIN public.organizers o ON o.user_id = u.id AND r.name IN ('ORGANIZER_STAFF'::role_name_enum, 'ORGANIZER_OWNER'::role_name_enum)
  WHERE u.id = target_user_id;
END;
$$;

COMMENT ON FUNCTION public.get_auth_user_by_email(TEXT) IS 'Returns enriched user data by email as a TABLE row with flattened structure including first_name, last_name, email, display_name (from auth.users), role_name, and role-specific fields (cyclist_id, cyclist_born_year, cyclist_gender_id, cyclist_gender_name, organizer_id, organization_id). Returns empty set if no user found with the given email.';

-- =====================================================
-- SECTION 3: Add get_auth_user_by_id RPC
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_auth_user_by_id(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  auth_user_id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  display_name TEXT,
  role_id UUID,
  role_name role_name_enum,
  cyclist_id UUID,
  cyclist_born_year INT,
  cyclist_gender_id UUID,
  cyclist_gender_name TEXT,
  organizer_id UUID,
  organization_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
SECURITY DEFINER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.auth_user_id,
    u.first_name,
    u.last_name,
    au.email,
    au.raw_user_meta_data->>'display_name',
    u.role_id,
    r.name,
    c.id,
    c.born_year,
    c.gender_id,
    cg.name,
    o.id,
    o.organization_id,
    u.created_at,
    u.updated_at
  FROM public.users u
  JOIN public.roles r ON u.role_id = r.id
  LEFT JOIN auth.users au ON u.auth_user_id = au.id
  LEFT JOIN public.cyclists c ON c.user_id = u.id AND r.name = 'CYCLIST'::role_name_enum
  LEFT JOIN public.cyclist_genders cg ON c.gender_id = cg.id
  LEFT JOIN public.organizers o ON o.user_id = u.id AND r.name IN ('ORGANIZER_STAFF'::role_name_enum, 'ORGANIZER_OWNER'::role_name_enum)
  WHERE u.id = p_user_id;
END;
$$;

COMMENT ON FUNCTION public.get_auth_user_by_id(UUID) IS 'Returns enriched user data by user ID as a TABLE row with flattened structure. Similar to get_auth_user but accepts user_id parameter instead of using session. Used for internal admin operations.';

-- =====================================================
-- SECTION 4: Add delete_user_by_id RPC
-- =====================================================

CREATE OR REPLACE FUNCTION public.delete_user_by_id(p_user_id UUID)
RETURNS jsonb
SECURITY DEFINER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_auth_user_id UUID;
BEGIN
  -- Get auth_user_id before deletion
  SELECT auth_user_id INTO v_auth_user_id
  FROM public.users
  WHERE id = p_user_id;

  -- Return error if user not found
  IF v_auth_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Delete cyclist record if exists
  DELETE FROM public.cyclists WHERE user_id = p_user_id;

  -- Delete organizer record if exists
  DELETE FROM public.organizers WHERE user_id = p_user_id;

  -- Delete user record (CASCADE will handle remaining relations)
  DELETE FROM public.users WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'auth_user_id', v_auth_user_id
  );
END;
$$;

COMMENT ON FUNCTION public.delete_user_by_id(UUID) IS 'Atomically deletes user and related records (cyclists, organizers) from public tables. Returns auth_user_id for subsequent auth deletion. Does not delete from auth.users table.';

-- =====================================================
-- END OF CONSOLIDATED MIGRATION 04
-- =====================================================

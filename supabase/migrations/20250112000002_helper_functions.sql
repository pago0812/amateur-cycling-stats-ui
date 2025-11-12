-- =====================================================
-- Migration 02: Helper Functions & RPCs
-- =====================================================
-- Creates all RLS helper functions and RPC functions
-- Includes updated functions with short_id and organizer_owner role
-- =====================================================

-- =====================================================
-- SECTION 1: Core Role Check Functions
-- =====================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.name
  FROM public.users u
  JOIN public.roles r ON u.role_id = r.id
  WHERE u.auth_user_id = auth.uid();
$$;

COMMENT ON FUNCTION public.get_my_role() IS 'Returns current authenticated user''s role name';

-- Check if current user has specific role
CREATE OR REPLACE FUNCTION public.has_role(role_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.auth_user_id = auth.uid()
      AND r.name = role_name
  );
$$;

COMMENT ON FUNCTION public.has_role(TEXT) IS 'Checks if current user has the specified role';

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role('admin');
$$;

COMMENT ON FUNCTION public.is_admin() IS 'Returns TRUE if current user has admin role';

-- =====================================================
-- SECTION 2: Organization Check Functions
-- =====================================================

-- Check if user has organizer profile (owner or staff)
CREATE OR REPLACE FUNCTION public.is_organizer()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organizers
    JOIN public.users ON organizers.user_id = users.id
    WHERE users.auth_user_id = auth.uid()
  );
$$;

COMMENT ON FUNCTION public.is_organizer() IS 'Returns TRUE if current user has an organizer profile (either owner or staff)';

-- Check if user is organizer owner (not staff)
CREATE OR REPLACE FUNCTION public.is_organizer_owner()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organizers
    JOIN public.users ON organizers.user_id = users.id
    JOIN public.roles ON users.role_id = roles.id
    WHERE users.auth_user_id = auth.uid()
      AND roles.name = 'organizer_owner'
  );
$$;

COMMENT ON FUNCTION public.is_organizer_owner() IS 'Returns TRUE if current user is an organizer with organizer_owner role';

-- Get user's organization ID (if they're an organizer)
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.organizers
  JOIN public.users ON organizers.user_id = users.id
  WHERE users.auth_user_id = auth.uid()
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_user_organization_id() IS 'Returns organization_id for current user''s organizer profile, NULL if not an organizer';

-- Check if user is in same organization as event
CREATE OR REPLACE FUNCTION public.is_in_event_organization(event_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.events e
    JOIN public.organizers event_org ON e.organization_id = event_org.organization_id
    JOIN public.users ON event_org.user_id = users.id
    WHERE e.id = event_id
      AND users.auth_user_id = auth.uid()
  );
$$;

COMMENT ON FUNCTION public.is_in_event_organization(UUID) IS 'Returns TRUE if current user belongs to the organization that owns the event';

-- =====================================================
-- SECTION 3: Cyclist Check Functions
-- =====================================================

-- Check if cyclist is unlinked (no auth_user_id)
CREATE OR REPLACE FUNCTION public.is_cyclist_unlinked(cyclist_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.cyclists c
    JOIN public.users u ON c.user_id = u.id
    WHERE c.id = cyclist_id
      AND u.auth_user_id IS NULL
  );
$$;

COMMENT ON FUNCTION public.is_cyclist_unlinked(UUID) IS 'Returns TRUE if cyclist has no auth_user_id (unregistered/anonymous cyclist)';

-- Check if cyclist was created by user's organization
CREATE OR REPLACE FUNCTION public.is_cyclist_created_by_org(cyclist_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.cyclists c
    JOIN public.race_results rr ON c.id = rr.cyclist_id
    JOIN public.races r ON rr.race_id = r.id
    WHERE c.id = cyclist_id
      AND public.is_in_event_organization(r.event_id)
  );
$$;

COMMENT ON FUNCTION public.is_cyclist_created_by_org(UUID) IS 'Returns TRUE if cyclist has results in events owned by current user''s organization';

-- =====================================================
-- SECTION 4: RPC Function - Get User With Relations
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_user_with_relations(user_short_id TEXT DEFAULT NULL)
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
  -- If short_id provided, lookup user ID
  IF user_short_id IS NOT NULL THEN
    SELECT id INTO target_user_id
    FROM public.users
    WHERE short_id = user_short_id
    LIMIT 1;
  ELSE
    -- Use authenticated user's auth.uid() to find their public user ID
    SELECT id INTO target_user_id
    FROM public.users
    WHERE auth_user_id = auth.uid()
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

  -- Build the base user object with role
  SELECT jsonb_build_object(
    'id', u.id,
    'short_id', u.short_id,
    'first_name', u.first_name,
    'last_name', u.last_name,
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
          'user_id', u.short_id,
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
      WHEN r.name IN ('organizer_staff', 'organizer_owner') THEN (
        SELECT jsonb_build_object(
          'id', o.id,
          'short_id', o.short_id,
          'user_id', u.short_id,
          'organization_id', o.organization_id,
          'created_at', o.created_at,
          'updated_at', o.updated_at,
          'organization', (
            SELECT jsonb_build_object(
              'id', org.id,
              'short_id', org.short_id,
              'name', org.name,
              'description', org.description,
              'is_active', org.is_active,
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

COMMENT ON FUNCTION public.get_user_with_relations(TEXT) IS 'Returns enriched user data with first_name, last_name, role, and related entities (cyclist or organizer with organization). If no short_id provided, returns data for the authenticated user.';

-- =====================================================
-- SECTION 5: RPC Function - Get Cyclist With Results
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_cyclist_with_results(cyclist_short_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  target_cyclist_id UUID;
BEGIN
  -- Find cyclist by short_id
  SELECT id INTO target_cyclist_id
  FROM public.cyclists
  WHERE short_id = cyclist_short_id;

  -- Return NULL if cyclist doesn't exist
  IF target_cyclist_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Build the cyclist object with nested race_results (using short_id as id)
  SELECT jsonb_build_object(
    'id', c.short_id,
    'first_name', u.first_name,
    'last_name', u.last_name,
    'born_year', c.born_year,
    'gender_id', c.gender_id,
    'user_id', u.short_id,
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
          'cyclist_id', c.short_id,
          'race_id', r.short_id,
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
            'event_id', e.short_id,
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
  JOIN public.users u ON c.user_id = u.id
  WHERE c.id = target_cyclist_id;

  RETURN result;
END;
$$;

COMMENT ON FUNCTION public.get_cyclist_with_results(TEXT) IS 'Returns enriched cyclist data with first_name, last_name from joined users table and nested race results array. Results sorted by event date (most recent first).';

-- =====================================================
-- END OF MIGRATION 02
-- =====================================================

-- =====================================================
-- Migration: Refactor Users & Cyclists Personal Information
-- =====================================================
-- Consolidates personal information in users table
-- - Users table: Remove username, add first_name/last_name, change PK structure
-- - Cyclists table: Remove name/last_name fields completely
-- - All names stored in users table (for both registered and unregistered)
-- - Sync display_name to auth.users metadata
-- =====================================================

-- =====================================================
-- SECTION 1: Drop Dependencies
-- =====================================================

-- Drop triggers that reference users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_created_create_cyclist ON public.users;
DROP TRIGGER IF EXISTS handle_users_updated_at ON public.users;

-- Drop policies on users table
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.users;
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.users;

-- Drop functions that reference old user structure
-- Drop all overloaded versions to avoid conflicts
DROP FUNCTION IF EXISTS public.get_user_with_relations(UUID);
DROP FUNCTION IF EXISTS public.get_user_with_relations(TEXT);
DROP FUNCTION IF EXISTS public.get_user_with_relations();
DROP FUNCTION IF EXISTS public.get_cyclist_with_results(UUID);
DROP FUNCTION IF EXISTS public.get_cyclist_with_results(TEXT);
DROP FUNCTION IF EXISTS public.get_cyclist_with_results();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_cyclist_user();

-- =====================================================
-- SECTION 2: Backup and Drop Tables
-- =====================================================

-- Note: In development, we drop tables. In production, you'd migrate data.
-- Since user said "we can drop the tables", we'll do a clean drop.

-- Drop dependent tables first
DROP TABLE IF EXISTS public.race_results CASCADE;
DROP TABLE IF EXISTS public.cyclists CASCADE;
DROP TABLE IF EXISTS public.organizers CASCADE;

-- Drop junction tables explicitly
DROP TABLE IF EXISTS public.event_supported_categories CASCADE;
DROP TABLE IF EXISTS public.event_supported_genders CASCADE;
DROP TABLE IF EXISTS public.event_supported_lengths CASCADE;

-- Drop events table
DROP TABLE IF EXISTS public.events CASCADE;

-- Drop users table (will be recreated with new structure)
DROP TABLE IF EXISTS public.users CASCADE;

-- =====================================================
-- SECTION 3: Recreate Users Table
-- =====================================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id TEXT NOT NULL UNIQUE,
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  role_id UUID REFERENCES public.roles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'User profiles - can be linked to auth.users (registered) or standalone (unregistered athletes)';
COMMENT ON COLUMN public.users.auth_user_id IS 'NULL for unregistered users (e.g., cyclists created by organizers without login credentials)';
COMMENT ON COLUMN public.users.first_name IS 'Required - first name for all users';
COMMENT ON COLUMN public.users.last_name IS 'Optional - last name for all users';

-- Create indexes
CREATE INDEX users_auth_user_id_idx ON public.users(auth_user_id);
CREATE INDEX users_role_id_idx ON public.users(role_id);
CREATE INDEX users_short_id_idx ON public.users(short_id);

-- =====================================================
-- SECTION 4: Recreate Cyclists Table
-- =====================================================

CREATE TABLE public.cyclists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  born_year INT,
  gender_id UUID REFERENCES public.cyclist_genders(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_id UNIQUE (user_id)
);

COMMENT ON TABLE public.cyclists IS 'Cyclist profiles - all cyclists MUST have a linked user (for name storage)';
COMMENT ON COLUMN public.cyclists.user_id IS 'Required - every cyclist links to users table for name data';

-- Indexes
CREATE INDEX cyclists_user_id_idx ON public.cyclists(user_id);
CREATE INDEX cyclists_gender_id_idx ON public.cyclists(gender_id);
CREATE INDEX cyclists_short_id_idx ON public.cyclists(short_id);

-- =====================================================
-- SECTION 5: Recreate Dependent Tables
-- =====================================================

-- Organizers table
CREATE TABLE public.organizers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_organization UNIQUE (user_id, organization_id)
);

CREATE INDEX organizers_user_id_idx ON public.organizers(user_id);
CREATE INDEX organizers_organization_id_idx ON public.organizers(organization_id);
CREATE INDEX organizers_short_id_idx ON public.organizers(short_id);

-- Events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  event_status TEXT NOT NULL DEFAULT 'DRAFT',
  year INT NOT NULL,
  country TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT,
  is_public_visible BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT event_status_check CHECK (event_status IN ('DRAFT', 'AVAILABLE', 'SOLD_OUT', 'ON_GOING', 'FINISHED'))
);

CREATE INDEX events_created_by_idx ON public.events(created_by);
CREATE INDEX events_organization_id_idx ON public.events(organization_id);
CREATE INDEX events_event_status_idx ON public.events(event_status);
CREATE INDEX events_year_idx ON public.events(year);
CREATE INDEX events_is_public_visible_idx ON public.events(is_public_visible);
CREATE INDEX events_short_id_idx ON public.events(short_id);

-- Event junction tables
CREATE TABLE public.event_supported_categories (
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  race_category_id UUID NOT NULL REFERENCES public.race_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, race_category_id)
);

CREATE TABLE public.event_supported_genders (
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  race_category_gender_id UUID NOT NULL REFERENCES public.race_category_genders(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, race_category_gender_id)
);

CREATE TABLE public.event_supported_lengths (
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  race_category_length_id UUID NOT NULL REFERENCES public.race_category_lengths(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, race_category_length_id)
);

-- Race results table
CREATE TABLE public.race_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id TEXT NOT NULL UNIQUE,
  race_id UUID NOT NULL REFERENCES public.races(id) ON DELETE CASCADE,
  cyclist_id UUID NOT NULL REFERENCES public.cyclists(id) ON DELETE RESTRICT,
  ranking_point_id UUID REFERENCES public.ranking_points(id) ON DELETE SET NULL,
  time TEXT,
  place INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_race_cyclist UNIQUE (race_id, cyclist_id)
);

CREATE INDEX race_results_race_id_idx ON public.race_results(race_id);
CREATE INDEX race_results_cyclist_id_idx ON public.race_results(cyclist_id);
CREATE INDEX race_results_place_idx ON public.race_results(place);
CREATE INDEX race_results_short_id_idx ON public.race_results(short_id);

-- =====================================================
-- SECTION 6: Create Triggers for short_id Generation
-- =====================================================

-- Function to generate short_id using nanoid
CREATE OR REPLACE FUNCTION public.generate_short_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN lower(substr(md5(random()::text || clock_timestamp()::text), 1, 10));
END;
$$;

-- Trigger function to auto-generate short_id
CREATE OR REPLACE FUNCTION public.handle_short_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.short_id IS NULL OR NEW.short_id = '' THEN
    NEW.short_id := public.generate_short_id();
  END IF;
  RETURN NEW;
END;
$$;

-- Attach short_id triggers
CREATE TRIGGER set_users_short_id
  BEFORE INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_short_id();

CREATE TRIGGER set_cyclists_short_id
  BEFORE INSERT ON public.cyclists
  FOR EACH ROW EXECUTE FUNCTION public.handle_short_id();

CREATE TRIGGER set_organizers_short_id
  BEFORE INSERT ON public.organizers
  FOR EACH ROW EXECUTE FUNCTION public.handle_short_id();

CREATE TRIGGER set_events_short_id
  BEFORE INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_short_id();

CREATE TRIGGER set_race_results_short_id
  BEFORE INSERT ON public.race_results
  FOR EACH ROW EXECUTE FUNCTION public.handle_short_id();

-- =====================================================
-- SECTION 7: Create updated_at Triggers
-- =====================================================

CREATE TRIGGER handle_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_cyclists_updated_at
  BEFORE UPDATE ON public.cyclists
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_organizers_updated_at
  BEFORE UPDATE ON public.organizers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_race_results_updated_at
  BEFORE UPDATE ON public.race_results
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SECTION 8: Sync Display Name to Auth Metadata
-- =====================================================

-- Trigger to sync display_name to auth.users.raw_user_meta_data
CREATE OR REPLACE FUNCTION public.sync_display_name_to_auth()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only sync if user has auth link and name changed
  IF NEW.auth_user_id IS NOT NULL AND (
    NEW.first_name IS DISTINCT FROM OLD.first_name OR
    NEW.last_name IS DISTINCT FROM OLD.last_name
  ) THEN
    -- Update auth.users.raw_user_meta_data with display_name
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{display_name}',
      to_jsonb(NEW.first_name || ' ' || COALESCE(NEW.last_name, ''))
    )
    WHERE id = NEW.auth_user_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to users table
CREATE TRIGGER sync_user_display_name
  AFTER INSERT OR UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_display_name_to_auth();

-- =====================================================
-- SECTION 9: Auto-Create User Profile on Auth Signup
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  cyclist_role_id UUID;
  user_first_name TEXT;
  user_last_name TEXT;
BEGIN
  -- Get the cyclist role ID (default role)
  SELECT id INTO cyclist_role_id FROM public.roles WHERE name = 'cyclist';

  -- Extract first_name and last_name from metadata
  user_first_name := NEW.raw_user_meta_data->>'first_name';
  user_last_name := NEW.raw_user_meta_data->>'last_name';

  -- Fallback to email prefix if no names provided
  IF user_first_name IS NULL OR user_first_name = '' THEN
    user_first_name := SPLIT_PART(NEW.email, '@', 1);
  END IF;

  -- Insert new user with cyclist role by default
  INSERT INTO public.users (auth_user_id, first_name, last_name, role_id, created_at, updated_at)
  VALUES (
    NEW.id,
    user_first_name,
    user_last_name,
    cyclist_role_id,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SECTION 10: Auto-Create Cyclist Profile for Cyclist Role
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_cyclist_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  cyclist_role_id UUID;
  default_gender_id UUID;
BEGIN
  -- Get the CYCLIST role ID
  SELECT id INTO cyclist_role_id FROM public.roles WHERE name = 'cyclist' LIMIT 1;

  -- Check if the new user has CYCLIST role
  IF NEW.role_id = cyclist_role_id THEN
    -- Get a default gender (will need to be updated by user later)
    SELECT id INTO default_gender_id FROM public.cyclist_genders LIMIT 1;

    -- Create cyclist profile (names come from users table now)
    INSERT INTO public.cyclists (user_id, gender_id)
    VALUES (
      NEW.id,
      default_gender_id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to users table
CREATE TRIGGER on_user_created_create_cyclist
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_cyclist_user();

-- =====================================================
-- SECTION 11: Update RPC Functions
-- =====================================================

-- Get User With Relations (updated to return first_name, last_name)
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
      WHEN r.name IN ('organizer_staff', 'organizer') THEN (
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

-- Get Cyclist With Results (updated to join users for names)
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
-- SECTION 12: Row Level Security - Users Table
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can view all user profiles
CREATE POLICY "Users can view all profiles"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete any profile
CREATE POLICY "Admins can delete any profile"
  ON public.users
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Admins can insert users (for creating unregistered users)
CREATE POLICY "Admins can insert users"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- =====================================================
-- END OF MIGRATION
-- =====================================================

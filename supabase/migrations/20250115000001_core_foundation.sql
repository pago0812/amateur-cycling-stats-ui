-- =====================================================
-- Consolidated Migration 01: Core Foundation
-- =====================================================
-- Consolidates: Core schema + Helper functions + RLS policies
-- Creates all base tables, triggers, RPC functions, RLS policies, and helper functions
-- =====================================================

-- =====================================================
-- SECTION 1: Utility Functions
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate short_id using nanoid simulation
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

-- =====================================================
-- SECTION 2: Roles Table
-- =====================================================

-- Create ENUM type for role names (most type-safe approach)
CREATE TYPE role_name_enum AS ENUM (
  'PUBLIC',
  'CYCLIST',
  'ORGANIZER_STAFF',
  'ORGANIZER_OWNER',
  'ADMIN'
);

COMMENT ON TYPE role_name_enum IS 'Valid role names - database-enforced enum for type safety';

CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id TEXT NOT NULL UNIQUE,
  name role_name_enum NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.roles IS 'User roles defining permission levels';

-- Indexes
CREATE INDEX IF NOT EXISTS roles_short_id_idx ON public.roles(short_id);

-- Trigger for short_id (MUST be created before INSERT)
CREATE TRIGGER set_roles_short_id
  BEFORE INSERT ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.handle_short_id();

-- Trigger for updated_at
CREATE TRIGGER handle_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Seed role data (with organizer_owner instead of organizer)
INSERT INTO public.roles (name) VALUES
  ('PUBLIC'),
  ('CYCLIST'),
  ('ORGANIZER_STAFF'),
  ('ORGANIZER_OWNER'),
  ('ADMIN')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SECTION 3: Users Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.users (
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
CREATE INDEX IF NOT EXISTS users_auth_user_id_idx ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS users_role_id_idx ON public.users(role_id);
CREATE INDEX IF NOT EXISTS users_short_id_idx ON public.users(short_id);

-- Trigger for short_id
CREATE TRIGGER set_users_short_id
  BEFORE INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_short_id();

-- Trigger for updated_at
CREATE TRIGGER handle_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SECTION 4: Organizations Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.organizations IS 'Organizations that manage cycling events';
COMMENT ON COLUMN public.organizations.is_active IS 'Soft delete flag - false means organization is inactive/deleted';

-- Indexes
CREATE INDEX IF NOT EXISTS organizations_short_id_idx ON public.organizations(short_id);
CREATE INDEX IF NOT EXISTS organizations_is_active_idx ON public.organizations(is_active);

-- Trigger for short_id
CREATE TRIGGER set_organizations_short_id
  BEFORE INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_short_id();

-- Trigger for updated_at
CREATE TRIGGER handle_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SECTION 5: Organizers Junction Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.organizers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_organization UNIQUE (user_id, organization_id)
);

COMMENT ON TABLE public.organizers IS 'Junction table linking users to organizations (many-to-many)';

-- Indexes
CREATE INDEX IF NOT EXISTS organizers_user_id_idx ON public.organizers(user_id);
CREATE INDEX IF NOT EXISTS organizers_organization_id_idx ON public.organizers(organization_id);
CREATE INDEX IF NOT EXISTS organizers_short_id_idx ON public.organizers(short_id);

-- Trigger for short_id
CREATE TRIGGER set_organizers_short_id
  BEFORE INSERT ON public.organizers
  FOR EACH ROW EXECUTE FUNCTION public.handle_short_id();

-- Trigger for updated_at
CREATE TRIGGER set_organizers_updated_at
  BEFORE UPDATE ON public.organizers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SECTION 6: Lookup Tables - Cyclist Genders
-- =====================================================

CREATE TABLE IF NOT EXISTS public.cyclist_genders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.cyclist_genders IS 'Lookup table for cyclist genders';

-- Indexes
CREATE INDEX IF NOT EXISTS cyclist_genders_short_id_idx ON public.cyclist_genders(short_id);

-- Trigger for short_id (MUST be created before INSERT)
CREATE TRIGGER set_cyclist_genders_short_id
  BEFORE INSERT ON public.cyclist_genders
  FOR EACH ROW EXECUTE FUNCTION public.handle_short_id();

-- Trigger for updated_at
CREATE TRIGGER set_cyclist_genders_updated_at
  BEFORE UPDATE ON public.cyclist_genders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Seed data
INSERT INTO public.cyclist_genders (name) VALUES
  ('M'),
  ('F')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SECTION 7: Lookup Tables - Race Categories
-- =====================================================

CREATE TABLE IF NOT EXISTS public.race_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.race_categories IS 'Lookup table for race categories (age/experience groups)';

-- Indexes
CREATE INDEX IF NOT EXISTS race_categories_short_id_idx ON public.race_categories(short_id);

-- Trigger for short_id (MUST be created before INSERT)
CREATE TRIGGER set_race_categories_short_id
  BEFORE INSERT ON public.race_categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_short_id();

-- Trigger for updated_at
CREATE TRIGGER set_race_categories_updated_at
  BEFORE UPDATE ON public.race_categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Seed data - 26 race categories
INSERT INTO public.race_categories (name) VALUES
  ('ABS'),
  ('ELITE'),
  ('ES_19_23'),
  ('JA_13_14'),
  ('JA_15_16'),
  ('JA_17_18'),
  ('MA'),
  ('MB'),
  ('MC'),
  ('MD'),
  ('ME'),
  ('R_18_29'),
  ('R_18_34'),
  ('R_18_39'),
  ('R_30_34'),
  ('R_30_39'),
  ('R_35_39'),
  ('R_40_44'),
  ('R_40_49'),
  ('R_45_49'),
  ('R_50_54'),
  ('R_50_59'),
  ('R_55_59'),
  ('R_60_64'),
  ('R_60_69'),
  ('R_65_69')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SECTION 8: Lookup Tables - Race Category Genders
-- =====================================================

CREATE TABLE IF NOT EXISTS public.race_category_genders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.race_category_genders IS 'Lookup table for race gender categories';

-- Indexes
CREATE INDEX IF NOT EXISTS race_category_genders_short_id_idx ON public.race_category_genders(short_id);

-- Trigger for short_id (MUST be created before INSERT)
CREATE TRIGGER set_race_category_genders_short_id
  BEFORE INSERT ON public.race_category_genders
  FOR EACH ROW EXECUTE FUNCTION public.handle_short_id();

-- Trigger for updated_at
CREATE TRIGGER set_race_category_genders_updated_at
  BEFORE UPDATE ON public.race_category_genders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Seed data
INSERT INTO public.race_category_genders (name) VALUES
  ('FEMALE'),
  ('MALE'),
  ('OPEN')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SECTION 9: Lookup Tables - Race Category Lengths
-- =====================================================

CREATE TABLE IF NOT EXISTS public.race_category_lengths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.race_category_lengths IS 'Lookup table for race distance categories';

-- Indexes
CREATE INDEX IF NOT EXISTS race_category_lengths_short_id_idx ON public.race_category_lengths(short_id);

-- Trigger for short_id (MUST be created before INSERT)
CREATE TRIGGER set_race_category_lengths_short_id
  BEFORE INSERT ON public.race_category_lengths
  FOR EACH ROW EXECUTE FUNCTION public.handle_short_id();

-- Trigger for updated_at
CREATE TRIGGER set_race_category_lengths_updated_at
  BEFORE UPDATE ON public.race_category_lengths
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Seed data
INSERT INTO public.race_category_lengths (name) VALUES
  ('LONG'),
  ('SHORT'),
  ('SPRINT'),
  ('UNIQUE')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SECTION 10: Lookup Tables - Race Rankings
-- =====================================================

CREATE TABLE IF NOT EXISTS public.race_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.race_rankings IS 'Lookup table for race ranking systems (UCI, national, regional, etc.)';

-- Indexes
CREATE INDEX IF NOT EXISTS race_rankings_short_id_idx ON public.race_rankings(short_id);

-- Trigger for short_id (MUST be created before INSERT)
CREATE TRIGGER set_race_rankings_short_id
  BEFORE INSERT ON public.race_rankings
  FOR EACH ROW EXECUTE FUNCTION public.handle_short_id();

-- Trigger for updated_at
CREATE TRIGGER set_race_rankings_updated_at
  BEFORE UPDATE ON public.race_rankings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Seed data - 4 common ranking systems
INSERT INTO public.race_rankings (name, description) VALUES
  ('UCI', 'Union Cycliste Internationale ranking system'),
  ('NATIONAL', 'National cycling federation ranking'),
  ('REGIONAL', 'Regional or local ranking system'),
  ('CUSTOM', 'Custom event-specific ranking')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SECTION 11: Cyclists Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.cyclists (
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
CREATE INDEX IF NOT EXISTS cyclists_user_id_idx ON public.cyclists(user_id);
CREATE INDEX IF NOT EXISTS cyclists_gender_id_idx ON public.cyclists(gender_id);
CREATE INDEX IF NOT EXISTS cyclists_short_id_idx ON public.cyclists(short_id);

-- Trigger for short_id
CREATE TRIGGER set_cyclists_short_id
  BEFORE INSERT ON public.cyclists
  FOR EACH ROW EXECUTE FUNCTION public.handle_short_id();

-- Trigger for updated_at
CREATE TRIGGER set_cyclists_updated_at
  BEFORE UPDATE ON public.cyclists
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SECTION 12: Events Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.events (
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

COMMENT ON TABLE public.events IS 'Cycling events containing multiple races';
COMMENT ON COLUMN public.events.created_by IS 'User who created the event (audit trail)';
COMMENT ON COLUMN public.events.organization_id IS 'Organization that owns/manages the event';

-- Indexes
CREATE INDEX IF NOT EXISTS events_created_by_idx ON public.events(created_by);
CREATE INDEX IF NOT EXISTS events_organization_id_idx ON public.events(organization_id);
CREATE INDEX IF NOT EXISTS events_event_status_idx ON public.events(event_status);
CREATE INDEX IF NOT EXISTS events_year_idx ON public.events(year);
CREATE INDEX IF NOT EXISTS events_is_public_visible_idx ON public.events(is_public_visible);
CREATE INDEX IF NOT EXISTS events_short_id_idx ON public.events(short_id);

-- Trigger for short_id
CREATE TRIGGER set_events_short_id
  BEFORE INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_short_id();

-- Trigger for updated_at
CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SECTION 13: Event Junction Tables
-- =====================================================

-- Event Supported Categories
CREATE TABLE IF NOT EXISTS public.event_supported_categories (
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  race_category_id UUID NOT NULL REFERENCES public.race_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, race_category_id)
);

COMMENT ON TABLE public.event_supported_categories IS 'Junction table for events and supported race categories';

-- Event Supported Genders
CREATE TABLE IF NOT EXISTS public.event_supported_genders (
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  race_category_gender_id UUID NOT NULL REFERENCES public.race_category_genders(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, race_category_gender_id)
);

COMMENT ON TABLE public.event_supported_genders IS 'Junction table for events and supported race genders';

-- Event Supported Lengths
CREATE TABLE IF NOT EXISTS public.event_supported_lengths (
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  race_category_length_id UUID NOT NULL REFERENCES public.race_category_lengths(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, race_category_length_id)
);

COMMENT ON TABLE public.event_supported_lengths IS 'Junction table for events and supported race lengths';

-- =====================================================
-- SECTION 14: Ranking Points Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.ranking_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id TEXT NOT NULL UNIQUE,
  race_ranking_id UUID NOT NULL REFERENCES public.race_rankings(id) ON DELETE RESTRICT,
  points INT NOT NULL,
  place INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_ranking_place UNIQUE (race_ranking_id, place)
);

COMMENT ON TABLE public.ranking_points IS 'Points awarded for each place in a ranking system';

-- Indexes
CREATE INDEX IF NOT EXISTS ranking_points_race_ranking_id_idx ON public.ranking_points(race_ranking_id);
CREATE INDEX IF NOT EXISTS ranking_points_short_id_idx ON public.ranking_points(short_id);

-- Trigger for short_id
CREATE TRIGGER set_ranking_points_short_id
  BEFORE INSERT ON public.ranking_points
  FOR EACH ROW EXECUTE FUNCTION public.handle_short_id();

-- Trigger for updated_at
CREATE TRIGGER set_ranking_points_updated_at
  BEFORE UPDATE ON public.ranking_points
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SECTION 15: Races Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.races (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id TEXT NOT NULL UNIQUE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT,
  description TEXT,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  race_category_id UUID NOT NULL REFERENCES public.race_categories(id) ON DELETE RESTRICT,
  race_category_gender_id UUID NOT NULL REFERENCES public.race_category_genders(id) ON DELETE RESTRICT,
  race_category_length_id UUID NOT NULL REFERENCES public.race_category_lengths(id) ON DELETE RESTRICT,
  race_ranking_id UUID NOT NULL REFERENCES public.race_rankings(id) ON DELETE RESTRICT,
  is_public_visible BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.races IS 'Individual races within cycling events';

-- Indexes
CREATE INDEX IF NOT EXISTS races_event_id_idx ON public.races(event_id);
CREATE INDEX IF NOT EXISTS races_race_category_id_idx ON public.races(race_category_id);
CREATE INDEX IF NOT EXISTS races_is_public_visible_idx ON public.races(is_public_visible);
CREATE INDEX IF NOT EXISTS races_short_id_idx ON public.races(short_id);

-- Trigger for short_id
CREATE TRIGGER set_races_short_id
  BEFORE INSERT ON public.races
  FOR EACH ROW EXECUTE FUNCTION public.handle_short_id();

-- Trigger for updated_at
CREATE TRIGGER set_races_updated_at
  BEFORE UPDATE ON public.races
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SECTION 16: Race Results Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.race_results (
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

COMMENT ON TABLE public.race_results IS 'Results for cyclists in races';

-- Indexes
CREATE INDEX IF NOT EXISTS race_results_race_id_idx ON public.race_results(race_id);
CREATE INDEX IF NOT EXISTS race_results_cyclist_id_idx ON public.race_results(cyclist_id);
CREATE INDEX IF NOT EXISTS race_results_place_idx ON public.race_results(place);
CREATE INDEX IF NOT EXISTS race_results_short_id_idx ON public.race_results(short_id);

-- Trigger for short_id
CREATE TRIGGER set_race_results_short_id
  BEFORE INSERT ON public.race_results
  FOR EACH ROW EXECUTE FUNCTION public.handle_short_id();

-- Trigger for updated_at
CREATE TRIGGER set_race_results_updated_at
  BEFORE UPDATE ON public.race_results
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SECTION 17: Auth Integration Triggers
-- =====================================================

-- Auto-create user profile on signup
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
  SELECT id INTO cyclist_role_id FROM public.roles WHERE name = 'CYCLIST'::role_name_enum;

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

-- Auto-create cyclist profile for users with cyclist role
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
  SELECT id INTO cyclist_role_id FROM public.roles WHERE name = 'CYCLIST'::role_name_enum LIMIT 1;

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

-- Sync display name to auth.users metadata
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
-- SECTION 18: Fix auth.users NULL Token Fields
-- =====================================================
-- Prevents "converting NULL to string is unsupported" errors during login

UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  recovery_sent_at = COALESCE(recovery_sent_at, NOW()),
  last_sign_in_at = COALESCE(last_sign_in_at, NOW())
WHERE
  confirmation_token IS NULL
  OR recovery_token IS NULL
  OR email_change_token_new IS NULL
  OR email_change_token_current IS NULL
  OR phone_change_token IS NULL
  OR reauthentication_token IS NULL
  OR recovery_sent_at IS NULL
  OR last_sign_in_at IS NULL;

-- =====================================================
-- SECTION 19: Core Role Check Functions
-- =====================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS role_name_enum
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
CREATE OR REPLACE FUNCTION public.has_role(role_name role_name_enum)
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

COMMENT ON FUNCTION public.has_role(role_name_enum) IS 'Checks if current user has the specified role';

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role('ADMIN'::role_name_enum);
$$;

COMMENT ON FUNCTION public.is_admin() IS 'Returns TRUE if current user has admin role';

-- =====================================================
-- SECTION 20: Organization Check Functions
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
      AND roles.name = 'ORGANIZER_OWNER'::role_name_enum
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
-- SECTION 21: Cyclist Check Functions
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
-- SECTION 22: RPC Function - Get User With Relations
-- Get race results by user short_id
-- This function fetches ONLY race results for a user (not the cyclist profile)
-- Useful when you already have user/cyclist data and only need their race history
CREATE OR REPLACE FUNCTION public.get_race_results_by_user_short_id(p_user_short_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  target_cyclist_id UUID;
BEGIN
  -- Find cyclist by user's short_id
  SELECT c.id INTO target_cyclist_id
  FROM public.cyclists c
  JOIN public.users u ON c.user_id = u.id
  WHERE u.short_id = p_user_short_id;

  -- Return empty array if cyclist doesn't exist or has no results
  IF target_cyclist_id IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;

  -- Build race_results array (using short_id as id)
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
  ), '[]'::jsonb) INTO result
  FROM public.race_results rr
  JOIN public.races r ON rr.race_id = r.id
  JOIN public.events e ON r.event_id = e.id
  JOIN public.race_categories rc ON r.race_category_id = rc.id
  JOIN public.race_category_genders rcg ON r.race_category_gender_id = rcg.id
  JOIN public.race_category_lengths rcl ON r.race_category_length_id = rcl.id
  JOIN public.race_rankings rrank ON r.race_ranking_id = rrank.id
  JOIN public.cyclists c ON rr.cyclist_id = c.id
  WHERE rr.cyclist_id = target_cyclist_id;

  RETURN result;
END;
$$;

COMMENT ON FUNCTION public.get_race_results_by_user_short_id(TEXT) IS 'Returns only race results array for a user (by user short_id). Does not return cyclist profile. Results sorted by event date (most recent first). Returns empty array if user has no cyclist profile or no results.';

-- Get cyclist by user short_id
-- This function fetches cyclist profile data (users + roles + cyclists)
-- Does NOT join auth.users or race results
-- Useful for parallel fetching with race results
CREATE OR REPLACE FUNCTION public.get_cyclist_by_user_short_id(p_user_short_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  target_user_id UUID;
BEGIN
  -- Find user by short_id
  SELECT id INTO target_user_id
  FROM public.users
  WHERE short_id = p_user_short_id;

  -- Return NULL if user doesn't exist
  IF target_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Build cyclist object (users + roles + cyclists, NO auth.users)
  SELECT jsonb_build_object(
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
      WHEN c.id IS NOT NULL THEN jsonb_build_object(
        'short_id', c.short_id,
        'born_year', c.born_year,
        'gender_id', c.gender_id,
        'created_at', c.created_at,
        'updated_at', c.updated_at,
        'gender', CASE WHEN cg.id IS NOT NULL THEN jsonb_build_object(
          'id', cg.id,
          'short_id', cg.short_id,
          'name', cg.name,
          'created_at', cg.created_at,
          'updated_at', cg.updated_at
        ) ELSE NULL END
      )
      ELSE NULL
    END
  ) INTO result
  FROM public.users u
  JOIN public.roles r ON u.role_id = r.id
  LEFT JOIN public.cyclists c ON c.user_id = u.id
  LEFT JOIN public.cyclist_genders cg ON c.gender_id = cg.id
  WHERE u.id = target_user_id;

  RETURN result;
END;
$$;

COMMENT ON FUNCTION public.get_cyclist_by_user_short_id(TEXT) IS 'Returns cyclist profile data (users + roles + cyclists) by user short_id. Does NOT join auth.users or race results. Returns NULL if user does not exist. Optimized for parallel fetching with race results.';

-- =====================================================
-- SECTION 24: Enable RLS on All Tables
-- =====================================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cyclist_genders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_category_genders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_category_lengths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cyclists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.races ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranking_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_supported_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_supported_genders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_supported_lengths ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SECTION 25: Roles Table Policies
-- =====================================================

CREATE POLICY "Authenticated users can view roles"
  ON public.roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage roles"
  ON public.roles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================
-- SECTION 26: Users Table Policies
-- =====================================================

CREATE POLICY "Everyone can view user profiles"
  ON public.users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Admins can manage all users"
  ON public.users
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Organizers can create unlinked users"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_organizer()
    AND auth_user_id IS NULL
  );

CREATE POLICY "Organizers can update org unlinked users"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (
    public.is_organizer()
    AND auth_user_id IS NULL
    AND EXISTS (
      SELECT 1 FROM public.cyclists c
      WHERE c.user_id = users.id
        AND public.is_cyclist_created_by_org(c.id)
    )
  )
  WITH CHECK (
    public.is_organizer()
    AND auth_user_id IS NULL
  );

CREATE POLICY "Organizers can delete org unlinked users"
  ON public.users
  FOR DELETE
  TO authenticated
  USING (
    public.is_organizer()
    AND auth_user_id IS NULL
    AND EXISTS (
      SELECT 1 FROM public.cyclists c
      WHERE c.user_id = users.id
        AND public.is_cyclist_created_by_org(c.id)
    )
  );

-- =====================================================
-- SECTION 27: Organizations Table Policies
-- =====================================================

CREATE POLICY "Public can view active organizations"
  ON public.organizations
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can view all organizations"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert organizations"
  ON public.organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update any organization"
  ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Organizer owners can update own organization"
  ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (
    public.is_organizer_owner()
    AND id = public.get_user_organization_id()
  )
  WITH CHECK (
    public.is_organizer_owner()
    AND id = public.get_user_organization_id()
  );

-- =====================================================
-- SECTION 28: Organizers Table Policies
-- =====================================================

CREATE POLICY "Users can view own organizer profile"
  ON public.organizers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = organizers.user_id
        AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all organizers"
  ON public.organizers
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can manage all organizers"
  ON public.organizers
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Organizer owners can add org organizers"
  ON public.organizers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_organizer_owner()
    AND organization_id = public.get_user_organization_id()
  );

CREATE POLICY "Organizer owners can update org organizers"
  ON public.organizers
  FOR UPDATE
  TO authenticated
  USING (
    public.is_organizer_owner()
    AND organization_id = public.get_user_organization_id()
  )
  WITH CHECK (
    public.is_organizer_owner()
    AND organization_id = public.get_user_organization_id()
  );

CREATE POLICY "Organizer owners can delete org organizers"
  ON public.organizers
  FOR DELETE
  TO authenticated
  USING (
    public.is_organizer_owner()
    AND organization_id = public.get_user_organization_id()
  );

CREATE POLICY "Organizer staff can update own profile"
  ON public.organizers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = organizers.user_id
        AND users.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = organizers.user_id
        AND users.auth_user_id = auth.uid()
    )
  );

-- =====================================================
-- SECTION 29: Lookup Tables Policies
-- =====================================================

-- Cyclist Genders
CREATE POLICY "Everyone can view cyclist genders"
  ON public.cyclist_genders
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can manage cyclist genders"
  ON public.cyclist_genders
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Race Categories
CREATE POLICY "Everyone can view race categories"
  ON public.race_categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can manage race categories"
  ON public.race_categories
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Race Category Genders
CREATE POLICY "Everyone can view race category genders"
  ON public.race_category_genders
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can manage race category genders"
  ON public.race_category_genders
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Race Category Lengths
CREATE POLICY "Everyone can view race category lengths"
  ON public.race_category_lengths
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can manage race category lengths"
  ON public.race_category_lengths
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Race Rankings
CREATE POLICY "Everyone can view race rankings"
  ON public.race_rankings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can manage race rankings"
  ON public.race_rankings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================
-- SECTION 30: Ranking Points Policies
-- =====================================================

CREATE POLICY "Everyone can view ranking points"
  ON public.ranking_points
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can manage ranking points"
  ON public.ranking_points
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================
-- SECTION 31: Cyclists Table Policies
-- =====================================================

CREATE POLICY "Cyclists are viewable by everyone"
  ON public.cyclists
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert own cyclist profile"
  ON public.cyclists
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = cyclists.user_id
        AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can insert cyclist profiles"
  ON public.cyclists
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_organizer());

CREATE POLICY "Admins can insert cyclist profiles"
  ON public.cyclists
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Cyclists can update own profile"
  ON public.cyclists
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = cyclists.user_id
        AND users.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = cyclists.user_id
        AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can update org cyclists"
  ON public.cyclists
  FOR UPDATE
  TO authenticated
  USING (
    public.is_organizer()
    AND public.is_cyclist_created_by_org(cyclists.id)
  )
  WITH CHECK (
    public.is_organizer()
    AND public.is_cyclist_created_by_org(cyclists.id)
  );

CREATE POLICY "Admins can update any cyclist"
  ON public.cyclists
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete any cyclist"
  ON public.cyclists
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Organizers can delete unlinked org cyclists"
  ON public.cyclists
  FOR DELETE
  TO authenticated
  USING (
    public.is_organizer()
    AND public.is_cyclist_unlinked(cyclists.id)
    AND public.is_cyclist_created_by_org(cyclists.id)
  );

-- =====================================================
-- SECTION 32: Events Table Policies
-- =====================================================

CREATE POLICY "Events are viewable based on visibility"
  ON public.events
  FOR SELECT
  TO public
  USING (
    is_public_visible = true
    OR public.is_in_event_organization(id)
    OR public.is_admin()
  );

CREATE POLICY "Organizers can create events for their org"
  ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      public.is_organizer()
      AND organization_id = public.get_user_organization_id()
    )
    OR public.is_admin()
  );

CREATE POLICY "Organization members can update events"
  ON public.events
  FOR UPDATE
  TO authenticated
  USING (
    public.is_in_event_organization(id)
    OR public.is_admin()
  )
  WITH CHECK (
    public.is_in_event_organization(id)
    OR public.is_admin()
  );

CREATE POLICY "Organization members can delete events"
  ON public.events
  FOR DELETE
  TO authenticated
  USING (
    public.is_in_event_organization(id)
    OR public.is_admin()
  );

-- =====================================================
-- SECTION 33: Races Table Policies
-- =====================================================

CREATE POLICY "Races are viewable based on visibility"
  ON public.races
  FOR SELECT
  TO public
  USING (
    is_public_visible = true
    OR public.is_in_event_organization(event_id)
    OR public.is_admin()
  );

CREATE POLICY "Event organization members can create races"
  ON public.races
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_in_event_organization(event_id)
    OR public.is_admin()
  );

CREATE POLICY "Event organization members can update races"
  ON public.races
  FOR UPDATE
  TO authenticated
  USING (
    public.is_in_event_organization(event_id)
    OR public.is_admin()
  )
  WITH CHECK (
    public.is_in_event_organization(event_id)
    OR public.is_admin()
  );

CREATE POLICY "Event organization members can delete races"
  ON public.races
  FOR DELETE
  TO authenticated
  USING (
    public.is_in_event_organization(event_id)
    OR public.is_admin()
  );

-- =====================================================
-- SECTION 34: Race Results Table Policies
-- =====================================================

CREATE POLICY "Race results are viewable based on visibility"
  ON public.race_results
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.races
      JOIN public.events ON races.event_id = events.id
      WHERE races.id = race_results.race_id
        AND races.is_public_visible = true
        AND events.is_public_visible = true
    )
    OR EXISTS (
      SELECT 1 FROM public.races
      WHERE races.id = race_results.race_id
        AND public.is_in_event_organization(races.event_id)
    )
    OR public.is_admin()
  );

CREATE POLICY "Event organization members can create race results"
  ON public.race_results
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.races
      WHERE races.id = race_id
        AND public.is_in_event_organization(races.event_id)
    )
    OR public.is_admin()
  );

CREATE POLICY "Event organization members can update race results"
  ON public.race_results
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.races
      WHERE races.id = race_results.race_id
        AND public.is_in_event_organization(races.event_id)
    )
    OR public.is_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.races
      WHERE races.id = race_results.race_id
        AND public.is_in_event_organization(races.event_id)
    )
    OR public.is_admin()
  );

CREATE POLICY "Event organization members can delete race results"
  ON public.race_results
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.races
      WHERE races.id = race_results.race_id
        AND public.is_in_event_organization(races.event_id)
    )
    OR public.is_admin()
  );

-- =====================================================
-- SECTION 35: Junction Tables Policies
-- =====================================================

-- Event Supported Categories
CREATE POLICY "Event supported categories viewable with event"
  ON public.event_supported_categories
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_id
        AND (
          events.is_public_visible = true
          OR public.is_in_event_organization(events.id)
          OR public.is_admin()
        )
    )
  );

CREATE POLICY "Event organization can manage supported categories"
  ON public.event_supported_categories
  FOR ALL
  TO authenticated
  USING (
    public.is_in_event_organization(event_id)
    OR public.is_admin()
  )
  WITH CHECK (
    public.is_in_event_organization(event_id)
    OR public.is_admin()
  );

-- Event Supported Genders
CREATE POLICY "Event supported genders viewable with event"
  ON public.event_supported_genders
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_id
        AND (
          events.is_public_visible = true
          OR public.is_in_event_organization(events.id)
          OR public.is_admin()
        )
    )
  );

CREATE POLICY "Event organization can manage supported genders"
  ON public.event_supported_genders
  FOR ALL
  TO authenticated
  USING (
    public.is_in_event_organization(event_id)
    OR public.is_admin()
  )
  WITH CHECK (
    public.is_in_event_organization(event_id)
    OR public.is_admin()
  );

-- Event Supported Lengths
CREATE POLICY "Event supported lengths viewable with event"
  ON public.event_supported_lengths
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_id
        AND (
          events.is_public_visible = true
          OR public.is_in_event_organization(events.id)
          OR public.is_admin()
        )
    )
  );

CREATE POLICY "Event organization can manage supported lengths"
  ON public.event_supported_lengths
  FOR ALL
  TO authenticated
  USING (
    public.is_in_event_organization(event_id)
    OR public.is_admin()
  )
  WITH CHECK (
    public.is_in_event_organization(event_id)
    OR public.is_admin()
  );

-- =====================================================
-- END OF CONSOLIDATED MIGRATION 01
-- =====================================================

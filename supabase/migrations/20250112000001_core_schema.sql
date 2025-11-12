-- =====================================================
-- Migration 01: Core Schema
-- =====================================================
-- Consolidates: Auth foundation, organizations, lookup tables, main entities
-- Creates all base tables with short_id support and organizer_owner role
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

CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
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
  ('public'),
  ('cyclist'),
  ('organizer_staff'),
  ('organizer_owner'),
  ('admin')
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
-- END OF MIGRATION 01
-- =====================================================

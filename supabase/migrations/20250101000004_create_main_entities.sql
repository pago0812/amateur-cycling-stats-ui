-- =====================================================
-- Migration 04: Main Entities
-- =====================================================
-- Creates core domain entities: cyclists, events, races, race_results
-- Includes junction tables and ranking points
-- =====================================================

-- =====================================================
-- SECTION 1: Cyclists Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.cyclists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  born_year INT,
  gender_id UUID REFERENCES public.cyclist_genders(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.cyclists IS 'Cyclist profiles - can be linked to user accounts or created independently by organizers';
COMMENT ON COLUMN public.cyclists.user_id IS 'Foreign key to users table - NULL when organizers create profiles for unregistered cyclists, linked later during reconciliation';

-- Indexes
CREATE INDEX IF NOT EXISTS cyclists_user_id_idx ON public.cyclists(user_id);
CREATE INDEX IF NOT EXISTS cyclists_gender_id_idx ON public.cyclists(gender_id);

-- Attach updated_at trigger
DROP TRIGGER IF EXISTS set_cyclists_updated_at ON public.cyclists;
CREATE TRIGGER set_cyclists_updated_at
  BEFORE UPDATE ON public.cyclists
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SECTION 2: Events Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Attach updated_at trigger
DROP TRIGGER IF EXISTS set_events_updated_at ON public.events;
CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SECTION 3: Event Junction Tables (Many-to-Many)
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
-- SECTION 4: Ranking Points Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.ranking_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Attach updated_at trigger
DROP TRIGGER IF EXISTS set_ranking_points_updated_at ON public.ranking_points;
CREATE TRIGGER set_ranking_points_updated_at
  BEFORE UPDATE ON public.ranking_points
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SECTION 5: Races Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.races (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Attach updated_at trigger
DROP TRIGGER IF EXISTS set_races_updated_at ON public.races;
CREATE TRIGGER set_races_updated_at
  BEFORE UPDATE ON public.races
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SECTION 6: Race Results Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.race_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Attach updated_at trigger
DROP TRIGGER IF EXISTS set_race_results_updated_at ON public.race_results;
CREATE TRIGGER set_race_results_updated_at
  BEFORE UPDATE ON public.race_results
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SECTION 7: Auto-Create Cyclist Profile on Signup
-- =====================================================
-- Trigger to create minimal cyclist profile when user signs up with CYCLIST role

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

    -- Create minimal cyclist profile (empty name/last_name, to be filled later)
    INSERT INTO public.cyclists (user_id, name, last_name, gender_id)
    VALUES (
      NEW.id,
      '',  -- Empty name, to be filled by user
      '',  -- Empty last name, to be filled by user
      default_gender_id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to users table
DROP TRIGGER IF EXISTS on_user_created_create_cyclist ON public.users;
CREATE TRIGGER on_user_created_create_cyclist
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_cyclist_user();

-- =====================================================
-- END OF MIGRATION 04
-- =====================================================

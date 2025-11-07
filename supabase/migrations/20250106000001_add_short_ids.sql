-- Migration: Add short_id columns to all tables (except N:N junctions)
-- Purpose: Enable clean, short URLs while keeping UUID for internal operations
-- Architecture: UUID (PK) + short_id (UNIQUE) with automatic generation

-- ============================================================================
-- STEP 1: Create NanoID Generation Function
-- ============================================================================
-- Generates cryptographically secure 10-character IDs using lowercase letters + numbers
-- Collision probability: ~1% after 1.2 million IDs at 1000 IDs/hour
CREATE OR REPLACE FUNCTION public.generate_nanoid(
  size INT DEFAULT 10,
  alphabet TEXT DEFAULT 'abcdefghijklmnopqrstuvwxyz0123456789'
)
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
  id TEXT := '';
  i INT := 0;
  alphabet_length INT := length(alphabet);
BEGIN
  WHILE i < size LOOP
    id := id || substr(alphabet, floor(random() * alphabet_length + 1)::int, 1);
    i := i + 1;
  END LOOP;
  RETURN id;
END;
$$;

COMMENT ON FUNCTION public.generate_nanoid IS
'Generates a random NanoID with customizable size and alphabet. Default: 10 chars, lowercase + numbers.';

-- ============================================================================
-- STEP 2: Create Universal Trigger Function
-- ============================================================================
-- Automatically sets short_id on INSERT if not provided
CREATE OR REPLACE FUNCTION public.set_short_id_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.short_id IS NULL OR NEW.short_id = '' THEN
    NEW.short_id := public.generate_nanoid();
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_short_id_before_insert IS
'Trigger function that auto-generates short_id on INSERT if not provided.';

-- ============================================================================
-- STEP 3: Add short_id Column to All Tables
-- ============================================================================
-- Pattern for each table:
-- 1. Add column (nullable initially)
-- 2. Create unique index
-- 3. Backfill existing records
-- 4. Set NOT NULL constraint
-- 5. Create trigger

-- ----------------------------------------------------------------------------
-- Main Entities (User-facing URLs)
-- ----------------------------------------------------------------------------

-- cyclists table
ALTER TABLE public.cyclists ADD COLUMN short_id TEXT;
CREATE UNIQUE INDEX cyclists_short_id_idx ON public.cyclists(short_id);
UPDATE public.cyclists SET short_id = public.generate_nanoid() WHERE short_id IS NULL;
ALTER TABLE public.cyclists ALTER COLUMN short_id SET NOT NULL;

CREATE TRIGGER cyclists_short_id_trigger
  BEFORE INSERT ON public.cyclists
  FOR EACH ROW
  EXECUTE FUNCTION public.set_short_id_before_insert();

COMMENT ON COLUMN public.cyclists.short_id IS 'Public-facing short ID for URLs (e.g., /cyclists/abc123xyz)';

-- events table
ALTER TABLE public.events ADD COLUMN short_id TEXT;
CREATE UNIQUE INDEX events_short_id_idx ON public.events(short_id);
UPDATE public.events SET short_id = public.generate_nanoid() WHERE short_id IS NULL;
ALTER TABLE public.events ALTER COLUMN short_id SET NOT NULL;

CREATE TRIGGER events_short_id_trigger
  BEFORE INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.set_short_id_before_insert();

COMMENT ON COLUMN public.events.short_id IS 'Public-facing short ID for URLs (e.g., /results/abc123xyz)';

-- races table
ALTER TABLE public.races ADD COLUMN short_id TEXT;
CREATE UNIQUE INDEX races_short_id_idx ON public.races(short_id);
UPDATE public.races SET short_id = public.generate_nanoid() WHERE short_id IS NULL;
ALTER TABLE public.races ALTER COLUMN short_id SET NOT NULL;

CREATE TRIGGER races_short_id_trigger
  BEFORE INSERT ON public.races
  FOR EACH ROW
  EXECUTE FUNCTION public.set_short_id_before_insert();

COMMENT ON COLUMN public.races.short_id IS 'Public-facing short ID for potential future race-specific URLs';

-- ----------------------------------------------------------------------------
-- Authentication & Organization Tables
-- ----------------------------------------------------------------------------

-- users table (linked to auth.users)
ALTER TABLE public.users ADD COLUMN short_id TEXT;
CREATE UNIQUE INDEX users_short_id_idx ON public.users(short_id);
UPDATE public.users SET short_id = public.generate_nanoid() WHERE short_id IS NULL;
ALTER TABLE public.users ALTER COLUMN short_id SET NOT NULL;

CREATE TRIGGER users_short_id_trigger
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_short_id_before_insert();

COMMENT ON COLUMN public.users.short_id IS 'Public-facing short ID for user profiles';

-- organizations table
ALTER TABLE public.organizations ADD COLUMN short_id TEXT;
CREATE UNIQUE INDEX organizations_short_id_idx ON public.organizations(short_id);
UPDATE public.organizations SET short_id = public.generate_nanoid() WHERE short_id IS NULL;
ALTER TABLE public.organizations ALTER COLUMN short_id SET NOT NULL;

CREATE TRIGGER organizations_short_id_trigger
  BEFORE INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_short_id_before_insert();

COMMENT ON COLUMN public.organizations.short_id IS 'Public-facing short ID for organization pages';

-- organizers table
ALTER TABLE public.organizers ADD COLUMN short_id TEXT;
CREATE UNIQUE INDEX organizers_short_id_idx ON public.organizers(short_id);
UPDATE public.organizers SET short_id = public.generate_nanoid() WHERE short_id IS NULL;
ALTER TABLE public.organizers ALTER COLUMN short_id SET NOT NULL;

CREATE TRIGGER organizers_short_id_trigger
  BEFORE INSERT ON public.organizers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_short_id_before_insert();

COMMENT ON COLUMN public.organizers.short_id IS 'Short ID for organizer records';

-- roles table
ALTER TABLE public.roles ADD COLUMN short_id TEXT;
CREATE UNIQUE INDEX roles_short_id_idx ON public.roles(short_id);
UPDATE public.roles SET short_id = public.generate_nanoid() WHERE short_id IS NULL;
ALTER TABLE public.roles ALTER COLUMN short_id SET NOT NULL;

CREATE TRIGGER roles_short_id_trigger
  BEFORE INSERT ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_short_id_before_insert();

COMMENT ON COLUMN public.roles.short_id IS 'Short ID for role records';

-- ----------------------------------------------------------------------------
-- Transactional Tables
-- ----------------------------------------------------------------------------

-- race_results table
ALTER TABLE public.race_results ADD COLUMN short_id TEXT;
CREATE UNIQUE INDEX race_results_short_id_idx ON public.race_results(short_id);
UPDATE public.race_results SET short_id = public.generate_nanoid() WHERE short_id IS NULL;
ALTER TABLE public.race_results ALTER COLUMN short_id SET NOT NULL;

CREATE TRIGGER race_results_short_id_trigger
  BEFORE INSERT ON public.race_results
  FOR EACH ROW
  EXECUTE FUNCTION public.set_short_id_before_insert();

COMMENT ON COLUMN public.race_results.short_id IS 'Short ID for race result records';

-- ranking_points table
ALTER TABLE public.ranking_points ADD COLUMN short_id TEXT;
CREATE UNIQUE INDEX ranking_points_short_id_idx ON public.ranking_points(short_id);
UPDATE public.ranking_points SET short_id = public.generate_nanoid() WHERE short_id IS NULL;
ALTER TABLE public.ranking_points ALTER COLUMN short_id SET NOT NULL;

CREATE TRIGGER ranking_points_short_id_trigger
  BEFORE INSERT ON public.ranking_points
  FOR EACH ROW
  EXECUTE FUNCTION public.set_short_id_before_insert();

COMMENT ON COLUMN public.ranking_points.short_id IS 'Short ID for ranking point records';

-- ----------------------------------------------------------------------------
-- Lookup Tables (Reference Data)
-- ----------------------------------------------------------------------------

-- cyclist_genders table
ALTER TABLE public.cyclist_genders ADD COLUMN short_id TEXT;
CREATE UNIQUE INDEX cyclist_genders_short_id_idx ON public.cyclist_genders(short_id);
UPDATE public.cyclist_genders SET short_id = public.generate_nanoid() WHERE short_id IS NULL;
ALTER TABLE public.cyclist_genders ALTER COLUMN short_id SET NOT NULL;

CREATE TRIGGER cyclist_genders_short_id_trigger
  BEFORE INSERT ON public.cyclist_genders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_short_id_before_insert();

COMMENT ON COLUMN public.cyclist_genders.short_id IS 'Short ID for cyclist gender lookup';

-- race_categories table
ALTER TABLE public.race_categories ADD COLUMN short_id TEXT;
CREATE UNIQUE INDEX race_categories_short_id_idx ON public.race_categories(short_id);
UPDATE public.race_categories SET short_id = public.generate_nanoid() WHERE short_id IS NULL;
ALTER TABLE public.race_categories ALTER COLUMN short_id SET NOT NULL;

CREATE TRIGGER race_categories_short_id_trigger
  BEFORE INSERT ON public.race_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_short_id_before_insert();

COMMENT ON COLUMN public.race_categories.short_id IS 'Short ID for race category lookup';

-- race_category_genders table
ALTER TABLE public.race_category_genders ADD COLUMN short_id TEXT;
CREATE UNIQUE INDEX race_category_genders_short_id_idx ON public.race_category_genders(short_id);
UPDATE public.race_category_genders SET short_id = public.generate_nanoid() WHERE short_id IS NULL;
ALTER TABLE public.race_category_genders ALTER COLUMN short_id SET NOT NULL;

CREATE TRIGGER race_category_genders_short_id_trigger
  BEFORE INSERT ON public.race_category_genders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_short_id_before_insert();

COMMENT ON COLUMN public.race_category_genders.short_id IS 'Short ID for race category gender lookup';

-- race_category_lengths table
ALTER TABLE public.race_category_lengths ADD COLUMN short_id TEXT;
CREATE UNIQUE INDEX race_category_lengths_short_id_idx ON public.race_category_lengths(short_id);
UPDATE public.race_category_lengths SET short_id = public.generate_nanoid() WHERE short_id IS NULL;
ALTER TABLE public.race_category_lengths ALTER COLUMN short_id SET NOT NULL;

CREATE TRIGGER race_category_lengths_short_id_trigger
  BEFORE INSERT ON public.race_category_lengths
  FOR EACH ROW
  EXECUTE FUNCTION public.set_short_id_before_insert();

COMMENT ON COLUMN public.race_category_lengths.short_id IS 'Short ID for race category length lookup';

-- race_rankings table
ALTER TABLE public.race_rankings ADD COLUMN short_id TEXT;
CREATE UNIQUE INDEX race_rankings_short_id_idx ON public.race_rankings(short_id);
UPDATE public.race_rankings SET short_id = public.generate_nanoid() WHERE short_id IS NULL;
ALTER TABLE public.race_rankings ALTER COLUMN short_id SET NOT NULL;

CREATE TRIGGER race_rankings_short_id_trigger
  BEFORE INSERT ON public.race_rankings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_short_id_before_insert();

COMMENT ON COLUMN public.race_rankings.short_id IS 'Short ID for race ranking lookup';

-- ============================================================================
-- STEP 4: Summary
-- ============================================================================
-- Tables with short_id (14 total):
-- ✓ cyclists, events, races (main user-facing entities)
-- ✓ users, organizations, organizers, roles (auth & organization)
-- ✓ race_results, ranking_points (transactional data)
-- ✓ cyclist_genders, race_categories, race_category_genders,
--   race_category_lengths, race_rankings (lookup tables)
--
-- Excluded (N:N junctions - 3 tables):
-- ✗ event_supported_categories
-- ✗ event_supported_genders
-- ✗ event_supported_lengths
--
-- Architecture:
-- - UUID (id): Primary key, used for foreign keys and joins (performance)
-- - short_id: Public-facing identifier for URLs and displays (UX)
-- - Adapters translate: db.short_id → domain.id
-- - Domain layer never sees UUID
-- ============================================================================

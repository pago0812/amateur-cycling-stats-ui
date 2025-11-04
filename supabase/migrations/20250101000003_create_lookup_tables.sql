-- =====================================================
-- Migration 03: Lookup/Reference Tables
-- =====================================================
-- Creates lookup tables for reference data (enums)
-- All lookup tables: Public read access, admin write access
-- =====================================================

-- =====================================================
-- SECTION 1: Cyclist Genders
-- =====================================================

CREATE TABLE IF NOT EXISTS public.cyclist_genders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.cyclist_genders IS 'Lookup table for cyclist genders';

-- Seed data
INSERT INTO public.cyclist_genders (name) VALUES
  ('M'),
  ('F')
ON CONFLICT (name) DO NOTHING;

-- Attach updated_at trigger
DROP TRIGGER IF EXISTS set_cyclist_genders_updated_at ON public.cyclist_genders;
CREATE TRIGGER set_cyclist_genders_updated_at
  BEFORE UPDATE ON public.cyclist_genders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SECTION 2: Race Categories
-- =====================================================

CREATE TABLE IF NOT EXISTS public.race_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.race_categories IS 'Lookup table for race categories (age/experience groups)';

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

-- Attach updated_at trigger
DROP TRIGGER IF EXISTS set_race_categories_updated_at ON public.race_categories;
CREATE TRIGGER set_race_categories_updated_at
  BEFORE UPDATE ON public.race_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SECTION 3: Race Category Genders
-- =====================================================

CREATE TABLE IF NOT EXISTS public.race_category_genders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.race_category_genders IS 'Lookup table for race gender categories';

-- Seed data
INSERT INTO public.race_category_genders (name) VALUES
  ('FEMALE'),
  ('MALE'),
  ('OPEN')
ON CONFLICT (name) DO NOTHING;

-- Attach updated_at trigger
DROP TRIGGER IF EXISTS set_race_category_genders_updated_at ON public.race_category_genders;
CREATE TRIGGER set_race_category_genders_updated_at
  BEFORE UPDATE ON public.race_category_genders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SECTION 4: Race Category Lengths
-- =====================================================

CREATE TABLE IF NOT EXISTS public.race_category_lengths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.race_category_lengths IS 'Lookup table for race distance categories';

-- Seed data
INSERT INTO public.race_category_lengths (name) VALUES
  ('LONG'),
  ('SHORT'),
  ('SPRINT'),
  ('UNIQUE')
ON CONFLICT (name) DO NOTHING;

-- Attach updated_at trigger
DROP TRIGGER IF EXISTS set_race_category_lengths_updated_at ON public.race_category_lengths;
CREATE TRIGGER set_race_category_lengths_updated_at
  BEFORE UPDATE ON public.race_category_lengths
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SECTION 5: Race Rankings
-- =====================================================

CREATE TABLE IF NOT EXISTS public.race_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.race_rankings IS 'Lookup table for race ranking systems (UCI, national, regional, etc.)';

-- Seed data - 4 common ranking systems
INSERT INTO public.race_rankings (name, description) VALUES
  ('UCI', 'Union Cycliste Internationale ranking system'),
  ('NATIONAL', 'National cycling federation ranking'),
  ('REGIONAL', 'Regional or local ranking system'),
  ('CUSTOM', 'Custom event-specific ranking')
ON CONFLICT (name) DO NOTHING;

-- Attach updated_at trigger
DROP TRIGGER IF EXISTS set_race_rankings_updated_at ON public.race_rankings;
CREATE TRIGGER set_race_rankings_updated_at
  BEFORE UPDATE ON public.race_rankings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SECTION 6: Row Level Security - All Lookup Tables
-- =====================================================

-- Enable RLS
ALTER TABLE public.cyclist_genders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_category_genders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_category_lengths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_rankings ENABLE ROW LEVEL SECURITY;

-- ==================
-- SELECT Policies (Everyone can read)
-- ==================

CREATE POLICY "Cyclist genders are viewable by everyone"
  ON public.cyclist_genders
  FOR SELECT
  USING (true);

CREATE POLICY "Race categories are viewable by everyone"
  ON public.race_categories
  FOR SELECT
  USING (true);

CREATE POLICY "Race category genders are viewable by everyone"
  ON public.race_category_genders
  FOR SELECT
  USING (true);

CREATE POLICY "Race category lengths are viewable by everyone"
  ON public.race_category_lengths
  FOR SELECT
  USING (true);

CREATE POLICY "Race rankings are viewable by everyone"
  ON public.race_rankings
  FOR SELECT
  USING (true);

-- ==================
-- INSERT/UPDATE/DELETE Policies (Admin only)
-- ==================

-- Cyclist Genders
CREATE POLICY "Only admins can insert cyclist genders"
  ON public.cyclist_genders
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update cyclist genders"
  ON public.cyclist_genders
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can delete cyclist genders"
  ON public.cyclist_genders
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Race Categories
CREATE POLICY "Only admins can insert race categories"
  ON public.race_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update race categories"
  ON public.race_categories
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can delete race categories"
  ON public.race_categories
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Race Category Genders
CREATE POLICY "Only admins can insert race category genders"
  ON public.race_category_genders
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update race category genders"
  ON public.race_category_genders
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can delete race category genders"
  ON public.race_category_genders
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Race Category Lengths
CREATE POLICY "Only admins can insert race category lengths"
  ON public.race_category_lengths
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update race category lengths"
  ON public.race_category_lengths
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can delete race category lengths"
  ON public.race_category_lengths
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Race Rankings
CREATE POLICY "Only admins can insert race rankings"
  ON public.race_rankings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update race rankings"
  ON public.race_rankings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can delete race rankings"
  ON public.race_rankings
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =====================================================
-- END OF MIGRATION 03
-- =====================================================

-- =====================================================
-- LOOKUP TABLES
-- =====================================================
-- These tables store reference/enum data for the application

-- ==================
-- CYCLIST GENDERS
-- ==================
CREATE TABLE IF NOT EXISTS public.cyclist_genders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.cyclist_genders IS 'Lookup table for cyclist genders';

INSERT INTO public.cyclist_genders (name) VALUES
    ('M'),
    ('F')
ON CONFLICT (name) DO NOTHING;

CREATE TRIGGER set_cyclist_genders_updated_at
    BEFORE UPDATE ON public.cyclist_genders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==================
-- RACE CATEGORIES
-- ==================
CREATE TABLE IF NOT EXISTS public.race_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.race_categories IS 'Lookup table for race categories (age/experience groups)';

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

CREATE TRIGGER set_race_categories_updated_at
    BEFORE UPDATE ON public.race_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==================
-- RACE CATEGORY GENDERS
-- ==================
CREATE TABLE IF NOT EXISTS public.race_category_genders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.race_category_genders IS 'Lookup table for race gender categories';

INSERT INTO public.race_category_genders (name) VALUES
    ('FEMALE'),
    ('MALE'),
    ('OPEN')
ON CONFLICT (name) DO NOTHING;

CREATE TRIGGER set_race_category_genders_updated_at
    BEFORE UPDATE ON public.race_category_genders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==================
-- RACE CATEGORY LENGTHS
-- ==================
CREATE TABLE IF NOT EXISTS public.race_category_lengths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.race_category_lengths IS 'Lookup table for race distance categories';

INSERT INTO public.race_category_lengths (name) VALUES
    ('LONG'),
    ('SHORT'),
    ('SPRINT'),
    ('UNIQUE')
ON CONFLICT (name) DO NOTHING;

CREATE TRIGGER set_race_category_lengths_updated_at
    BEFORE UPDATE ON public.race_category_lengths
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==================
-- RACE RANKINGS
-- ==================
CREATE TABLE IF NOT EXISTS public.race_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.race_rankings IS 'Lookup table for race ranking systems (UCI, national, regional, etc.)';

-- Seed with common ranking systems (can be updated by admin)
INSERT INTO public.race_rankings (name, description) VALUES
    ('UCI', 'Union Cycliste Internationale ranking system'),
    ('NATIONAL', 'National cycling federation ranking'),
    ('REGIONAL', 'Regional or local ranking system'),
    ('CUSTOM', 'Custom event-specific ranking')
ON CONFLICT (name) DO NOTHING;

CREATE TRIGGER set_race_rankings_updated_at
    BEFORE UPDATE ON public.race_rankings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- RLS POLICIES FOR LOOKUP TABLES
-- =====================================================

-- All lookup tables: Everyone can read, only admin can write
ALTER TABLE public.cyclist_genders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_category_genders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_category_lengths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_rankings ENABLE ROW LEVEL SECURITY;

-- SELECT policies (everyone can read)
CREATE POLICY "Cyclist genders are viewable by everyone"
    ON public.cyclist_genders FOR SELECT USING (true);

CREATE POLICY "Race categories are viewable by everyone"
    ON public.race_categories FOR SELECT USING (true);

CREATE POLICY "Race category genders are viewable by everyone"
    ON public.race_category_genders FOR SELECT USING (true);

CREATE POLICY "Race category lengths are viewable by everyone"
    ON public.race_category_lengths FOR SELECT USING (true);

CREATE POLICY "Race rankings are viewable by everyone"
    ON public.race_rankings FOR SELECT USING (true);

-- INSERT/UPDATE/DELETE policies (admin only)
-- Helper function to check if user is admin (reusable)
CREATE OR REPLACE FUNCTION public.is_admin_check()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users
        JOIN public.roles ON users.role_id = roles.id
        WHERE users.id = auth.uid() AND roles.type = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Apply admin-only write policies to all lookup tables
CREATE POLICY "Only admins can insert cyclist genders"
    ON public.cyclist_genders FOR INSERT
    WITH CHECK (public.is_admin_check());

CREATE POLICY "Only admins can update cyclist genders"
    ON public.cyclist_genders FOR UPDATE
    USING (public.is_admin_check());

CREATE POLICY "Only admins can delete cyclist genders"
    ON public.cyclist_genders FOR DELETE
    USING (public.is_admin_check());

CREATE POLICY "Only admins can insert race categories"
    ON public.race_categories FOR INSERT
    WITH CHECK (public.is_admin_check());

CREATE POLICY "Only admins can update race categories"
    ON public.race_categories FOR UPDATE
    USING (public.is_admin_check());

CREATE POLICY "Only admins can delete race categories"
    ON public.race_categories FOR DELETE
    USING (public.is_admin_check());

CREATE POLICY "Only admins can insert race category genders"
    ON public.race_category_genders FOR INSERT
    WITH CHECK (public.is_admin_check());

CREATE POLICY "Only admins can update race category genders"
    ON public.race_category_genders FOR UPDATE
    USING (public.is_admin_check());

CREATE POLICY "Only admins can delete race category genders"
    ON public.race_category_genders FOR DELETE
    USING (public.is_admin_check());

CREATE POLICY "Only admins can insert race category lengths"
    ON public.race_category_lengths FOR INSERT
    WITH CHECK (public.is_admin_check());

CREATE POLICY "Only admins can update race category lengths"
    ON public.race_category_lengths FOR UPDATE
    USING (public.is_admin_check());

CREATE POLICY "Only admins can delete race category lengths"
    ON public.race_category_lengths FOR DELETE
    USING (public.is_admin_check());

CREATE POLICY "Only admins can insert race rankings"
    ON public.race_rankings FOR INSERT
    WITH CHECK (public.is_admin_check());

CREATE POLICY "Only admins can update race rankings"
    ON public.race_rankings FOR UPDATE
    USING (public.is_admin_check());

CREATE POLICY "Only admins can delete race rankings"
    ON public.race_rankings FOR DELETE
    USING (public.is_admin_check());
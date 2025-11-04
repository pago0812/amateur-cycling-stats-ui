-- =====================================================
-- REFACTOR: Create Organizers Table
-- =====================================================
-- This migration properly separates organizers from regular users
-- Only organizers belong to organizations, not all users

-- =====================================================
-- CREATE ORGANIZERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.organizers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.organizers IS 'Organizer profiles linking users to organizations';
COMMENT ON COLUMN public.organizers.user_id IS 'Foreign key to users table - links organizer to authentication';
COMMENT ON COLUMN public.organizers.organization_id IS 'Organization the organizer belongs to';

CREATE INDEX IF NOT EXISTS organizers_user_id_idx ON public.organizers(user_id);
CREATE INDEX IF NOT EXISTS organizers_organization_id_idx ON public.organizers(organization_id);

CREATE TRIGGER set_organizers_updated_at
    BEFORE UPDATE ON public.organizers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- UPDATE EVENTS TABLE
-- =====================================================
-- Add organizer_id, remove organization_id (keep created_by for audit trail)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS organizer_id UUID REFERENCES public.organizers(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS events_organizer_id_idx ON public.events(organizer_id);

COMMENT ON COLUMN public.events.organizer_id IS 'Organizer who manages this event';
COMMENT ON COLUMN public.events.created_by IS 'User who created the event (for audit trail)';

-- Drop the organization_id column from events (if it exists)
ALTER TABLE public.events DROP COLUMN IF EXISTS organization_id;

-- =====================================================
-- REMOVE ORGANIZATION_ID FROM USERS TABLE
-- =====================================================
-- Users don't belong to organizations directly - only organizers do

-- First, drop policies that depend on users.organization_id
DROP POLICY IF EXISTS "Admins and org admins can update organizations" ON public.organizations;

-- Now drop the column
ALTER TABLE public.users DROP COLUMN IF EXISTS organization_id;

-- Recreate the organizations UPDATE policy with new logic
CREATE POLICY "Admins and org admins can update organizations"
    ON public.organizations
    FOR UPDATE
    USING (
        public.is_admin_check()
        OR EXISTS (
            SELECT 1 FROM public.organizers
            JOIN public.users ON organizers.user_id = users.id
            JOIN public.roles ON users.role_id = roles.id
            WHERE organizers.user_id = auth.uid()
            AND organizers.organization_id = organizations.id
            AND roles.type = 'organizer'
        )
    );

-- =====================================================
-- AUTO-CREATE ORGANIZER PROFILE FOR ORGANIZER USERS
-- =====================================================
-- Function to create organizer profile when user has organizer role
CREATE OR REPLACE FUNCTION public.handle_new_organizer_user()
RETURNS TRIGGER AS $$
DECLARE
    organizer_admin_role_id UUID;
    organizer_staff_role_id UUID;
BEGIN
    -- Get the organizer role IDs
    SELECT id INTO organizer_admin_role_id FROM public.roles WHERE type = 'organizer' LIMIT 1;
    SELECT id INTO organizer_staff_role_id FROM public.roles WHERE type = 'organizer_staff' LIMIT 1;

    -- Check if the new user has an organizer role
    -- Note: This requires manual organization assignment by admin later
    -- Or we could add organization_id to the raw_user_meta_data during signup
    IF NEW.role_id IN (organizer_admin_role_id, organizer_staff_role_id) THEN
        -- For now, we don't auto-create organizer profile
        -- This should be done by admin after user signs up
        -- Or during a separate onboarding flow
        RAISE NOTICE 'User with organizer role created. Organizer profile must be created by admin.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for organizer users
CREATE TRIGGER on_user_created_check_organizer
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_organizer_user();

-- =====================================================
-- DROP OLD POLICIES THAT DEPEND ON is_in_event_organization
-- =====================================================
-- We need to drop these before we can drop/recreate the function

-- Events policies (will be recreated below)
DROP POLICY IF EXISTS "Events are viewable based on visibility and organization" ON public.events;

-- Races policies
DROP POLICY IF EXISTS "Races are viewable based on visibility" ON public.races;
DROP POLICY IF EXISTS "Event organization members can create races" ON public.races;
DROP POLICY IF EXISTS "Event organization members can update races" ON public.races;
DROP POLICY IF EXISTS "Event creators and admins can delete races" ON public.races;

-- Race results policies
DROP POLICY IF EXISTS "Race results are viewable based on visibility" ON public.race_results;
DROP POLICY IF EXISTS "Event organization members can create race results" ON public.race_results;
DROP POLICY IF EXISTS "Event organization members can update race results" ON public.race_results;
DROP POLICY IF EXISTS "Organizer admins can delete race results" ON public.race_results;

-- Junction tables policies
DROP POLICY IF EXISTS "Event supported categories viewable with event" ON public.event_supported_categories;
DROP POLICY IF EXISTS "Event organization can manage supported categories" ON public.event_supported_categories;
DROP POLICY IF EXISTS "Event supported genders viewable with event" ON public.event_supported_genders;
DROP POLICY IF EXISTS "Event organization can manage supported genders" ON public.event_supported_genders;
DROP POLICY IF EXISTS "Event supported lengths viewable with event" ON public.event_supported_lengths;
DROP POLICY IF EXISTS "Event organization can manage supported lengths" ON public.event_supported_lengths;

-- =====================================================
-- UPDATE RLS HELPER FUNCTIONS
-- =====================================================

-- Drop old function that checked organization_id on users
DROP FUNCTION IF EXISTS public.is_in_event_organization(UUID);

-- New function to check if user is organizer of an event
CREATE OR REPLACE FUNCTION public.is_organizer_of_event(event_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.events e
        JOIN public.organizers o ON e.organizer_id = o.id
        WHERE e.id = event_id
        AND o.user_id = auth.uid()
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is in same organization as event's organizer
CREATE OR REPLACE FUNCTION public.is_in_event_organization(event_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.events e
        JOIN public.organizers event_org ON e.organizer_id = event_org.id
        JOIN public.organizers user_org ON event_org.organization_id = user_org.organization_id
        WHERE e.id = event_id
        AND user_org.user_id = auth.uid()
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is an organizer (has organizer profile)
CREATE OR REPLACE FUNCTION public.is_organizer()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.organizers
        WHERE organizers.user_id = auth.uid()
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is organizer admin (not staff)
CREATE OR REPLACE FUNCTION public.is_organizer_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.organizers
        JOIN public.users ON organizers.user_id = users.id
        JOIN public.roles ON users.role_id = roles.id
        WHERE organizers.user_id = auth.uid()
        AND roles.type = 'organizer'
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Get user's organization ID (if they're an organizer)
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID AS $$
    SELECT organization_id
    FROM public.organizers
    WHERE user_id = auth.uid()
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================================================
-- RLS POLICIES FOR ORGANIZERS TABLE
-- =====================================================
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;

-- Everyone can view organizer profiles
CREATE POLICY "Organizers are viewable by everyone"
    ON public.organizers
    FOR SELECT
    USING (true);

-- Only admins can create organizer profiles
CREATE POLICY "Only admins can create organizers"
    ON public.organizers
    FOR INSERT
    WITH CHECK (public.is_admin_check());

-- Admins and organizer admins can update their own org's organizers
CREATE POLICY "Admins and org admins can update organizers"
    ON public.organizers
    FOR UPDATE
    USING (
        public.is_admin_check()
        OR (
            public.is_organizer_admin()
            AND organization_id = public.get_user_organization_id()
        )
    );

-- Only admins can delete organizer profiles
CREATE POLICY "Only admins can delete organizers"
    ON public.organizers
    FOR DELETE
    USING (public.is_admin_check());

-- =====================================================
-- UPDATE EXISTING RLS POLICIES
-- =====================================================

-- Drop and recreate events policies with new organizer logic
DROP POLICY IF EXISTS "Events are viewable based on visibility and organization" ON public.events;
DROP POLICY IF EXISTS "Organizers can create events" ON public.events;
DROP POLICY IF EXISTS "Event creators and admins can update events" ON public.events;
DROP POLICY IF EXISTS "Event creators and admins can delete events" ON public.events;

-- Events SELECT policy
CREATE POLICY "Events are viewable based on visibility and organization"
    ON public.events
    FOR SELECT
    USING (
        is_public_visible = true
        OR public.is_in_event_organization(id)
        OR public.is_admin_check()
    );

-- Events INSERT policy - organizers must link their organizer profile
CREATE POLICY "Organizers can create events"
    ON public.events
    FOR INSERT
    WITH CHECK (
        public.is_organizer()
        AND organizer_id IN (
            SELECT id FROM public.organizers WHERE user_id = auth.uid()
        )
        OR public.is_admin_check()
    );

-- Events UPDATE policy
CREATE POLICY "Event organizers and admins can update events"
    ON public.events
    FOR UPDATE
    USING (
        public.is_organizer_of_event(id)
        OR public.is_admin_check()
    );

-- Events DELETE policy
CREATE POLICY "Event organizers and admins can delete events"
    ON public.events
    FOR DELETE
    USING (
        public.is_organizer_of_event(id)
        OR public.is_admin_check()
    );

-- =====================================================
-- RECREATE RACES POLICIES
-- =====================================================

CREATE POLICY "Races are viewable based on visibility"
    ON public.races
    FOR SELECT
    USING (
        (
            is_public_visible = true
            AND EXISTS (
                SELECT 1 FROM public.events
                WHERE events.id = races.event_id
                AND events.is_public_visible = true
            )
        )
        OR public.is_in_event_organization(event_id)
        OR public.is_admin_check()
    );

CREATE POLICY "Event organization members can create races"
    ON public.races
    FOR INSERT
    WITH CHECK (
        public.is_in_event_organization(event_id)
        OR public.is_admin_check()
    );

CREATE POLICY "Event organization members can update races"
    ON public.races
    FOR UPDATE
    USING (
        public.is_in_event_organization(event_id)
        OR public.is_admin_check()
    );

CREATE POLICY "Event organizers and admins can delete races"
    ON public.races
    FOR DELETE
    USING (
        public.is_organizer_of_event(event_id)
        OR public.is_admin_check()
    );

-- =====================================================
-- RECREATE RACE RESULTS POLICIES
-- =====================================================

CREATE POLICY "Race results are viewable based on visibility"
    ON public.race_results
    FOR SELECT
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
        OR public.is_admin_check()
    );

CREATE POLICY "Event organization members can create race results"
    ON public.race_results
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.races
            WHERE races.id = race_id
            AND public.is_in_event_organization(races.event_id)
        )
        OR public.is_admin_check()
    );

CREATE POLICY "Event organization members can update race results"
    ON public.race_results
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.races
            WHERE races.id = race_results.race_id
            AND public.is_in_event_organization(races.event_id)
        )
        OR public.is_admin_check()
    );

CREATE POLICY "Organizer admins can delete race results"
    ON public.race_results
    FOR DELETE
    USING (
        (
            EXISTS (
                SELECT 1 FROM public.races
                WHERE races.id = race_results.race_id
                AND public.is_in_event_organization(races.event_id)
            )
            AND public.is_organizer_admin()
        )
        OR public.is_admin_check()
    );

-- =====================================================
-- RECREATE JUNCTION TABLES POLICIES
-- =====================================================

CREATE POLICY "Event supported categories viewable with event"
    ON public.event_supported_categories
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = event_id
            AND (
                events.is_public_visible = true
                OR public.is_in_event_organization(events.id)
                OR public.is_admin_check()
            )
        )
    );

CREATE POLICY "Event organization can manage supported categories"
    ON public.event_supported_categories
    FOR ALL
    USING (
        public.is_in_event_organization(event_id)
        OR public.is_admin_check()
    )
    WITH CHECK (
        public.is_in_event_organization(event_id)
        OR public.is_admin_check()
    );

CREATE POLICY "Event supported genders viewable with event"
    ON public.event_supported_genders
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = event_id
            AND (
                events.is_public_visible = true
                OR public.is_in_event_organization(events.id)
                OR public.is_admin_check()
            )
        )
    );

CREATE POLICY "Event organization can manage supported genders"
    ON public.event_supported_genders
    FOR ALL
    USING (
        public.is_in_event_organization(event_id)
        OR public.is_admin_check()
    )
    WITH CHECK (
        public.is_in_event_organization(event_id)
        OR public.is_admin_check()
    );

CREATE POLICY "Event supported lengths viewable with event"
    ON public.event_supported_lengths
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = event_id
            AND (
                events.is_public_visible = true
                OR public.is_in_event_organization(events.id)
                OR public.is_admin_check()
            )
        )
    );

CREATE POLICY "Event organization can manage supported lengths"
    ON public.event_supported_lengths
    FOR ALL
    USING (
        public.is_in_event_organization(event_id)
        OR public.is_admin_check()
    )
    WITH CHECK (
        public.is_in_event_organization(event_id)
        OR public.is_admin_check()
    );
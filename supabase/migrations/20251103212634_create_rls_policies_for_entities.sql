-- =====================================================
-- ROW LEVEL SECURITY POLICIES FOR MAIN ENTITIES
-- =====================================================

-- Enable RLS on all main tables
ALTER TABLE public.cyclists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.races ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranking_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_supported_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_supported_genders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_supported_lengths ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Check if user is in same organization as event
CREATE OR REPLACE FUNCTION public.is_in_event_organization(event_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.events e
        JOIN public.users u ON u.organization_id = e.organization_id
        WHERE e.id = event_id
        AND u.id = auth.uid()
        AND u.organization_id IS NOT NULL
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user has organizer role (admin or staff)
CREATE OR REPLACE FUNCTION public.is_organizer()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users
        JOIN public.roles ON users.role_id = roles.id
        WHERE users.id = auth.uid()
        AND roles.type IN ('organizer', 'organizer_staff')
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is organizer admin (not staff)
CREATE OR REPLACE FUNCTION public.is_organizer_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users
        JOIN public.roles ON users.role_id = roles.id
        WHERE users.id = auth.uid()
        AND roles.type = 'organizer'
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================================================
-- CYCLISTS TABLE POLICIES
-- =====================================================

-- Everyone can view all cyclist profiles
CREATE POLICY "Cyclists are viewable by everyone"
    ON public.cyclists
    FOR SELECT
    USING (true);

-- Users can insert their own cyclist profile (via trigger), Organizers can create any cyclist, Admin can insert any
CREATE POLICY "Users and organizers can insert cyclist profiles"
    ON public.cyclists
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        OR public.is_organizer()
        OR public.is_admin_check()
    );

-- Cyclists can update their own profile, Organizers can update any cyclist, Admins can update any
CREATE POLICY "Cyclists and organizers can update profiles"
    ON public.cyclists
    FOR UPDATE
    USING (
        auth.uid() = user_id
        OR public.is_organizer()
        OR public.is_admin_check()
    );

-- Only admins can delete cyclist profiles
CREATE POLICY "Only admins can delete cyclists"
    ON public.cyclists
    FOR DELETE
    USING (public.is_admin_check());

-- =====================================================
-- EVENTS TABLE POLICIES
-- =====================================================

-- Public can see public events, org members can see their org events, admin sees all
CREATE POLICY "Events are viewable based on visibility and organization"
    ON public.events
    FOR SELECT
    USING (
        is_public_visible = true
        OR public.is_in_event_organization(id)
        OR public.is_admin_check()
    );

-- Organizers and admins can create events
CREATE POLICY "Organizers can create events"
    ON public.events
    FOR INSERT
    WITH CHECK (
        public.is_organizer()
        OR public.is_admin_check()
    );

-- Event creator and admins can update events
CREATE POLICY "Event creators and admins can update events"
    ON public.events
    FOR UPDATE
    USING (
        created_by = auth.uid()
        OR public.is_admin_check()
    );

-- Event creator and admins can delete events
CREATE POLICY "Event creators and admins can delete events"
    ON public.events
    FOR DELETE
    USING (
        created_by = auth.uid()
        OR public.is_admin_check()
    );

-- =====================================================
-- RACES TABLE POLICIES
-- =====================================================

-- Public can see races if both race and parent event are public, org members see their org races, admin sees all
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

-- Org members of event's org and admins can create races
CREATE POLICY "Event organization members can create races"
    ON public.races
    FOR INSERT
    WITH CHECK (
        public.is_in_event_organization(event_id)
        OR public.is_admin_check()
    );

-- Org members of event's org and admins can update races
CREATE POLICY "Event organization members can update races"
    ON public.races
    FOR UPDATE
    USING (
        public.is_in_event_organization(event_id)
        OR public.is_admin_check()
    );

-- Event creator and admins can delete races
CREATE POLICY "Event creators and admins can delete races"
    ON public.races
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = races.event_id
            AND events.created_by = auth.uid()
        )
        OR public.is_admin_check()
    );

-- =====================================================
-- RACE RESULTS TABLE POLICIES
-- =====================================================

-- Public can see results if race and event are public, org members see their org results, admin sees all
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

-- Org members of event's org (including staff) and admins can create results
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

-- Org members of event's org (including staff) and admins can update results
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

-- Only organizer admins of event's org and admins can delete results
CREATE POLICY "Organizer admins can delete race results"
    ON public.race_results
    FOR DELETE
    USING (
        (
            EXISTS (
                SELECT 1 FROM public.races
                JOIN public.events ON races.event_id = events.id
                WHERE races.id = race_results.race_id
                AND public.is_in_event_organization(races.event_id)
            )
            AND public.is_organizer_admin()
        )
        OR public.is_admin_check()
    );

-- =====================================================
-- RANKING POINTS TABLE POLICIES
-- =====================================================

-- Everyone can view ranking points
CREATE POLICY "Ranking points are viewable by everyone"
    ON public.ranking_points
    FOR SELECT
    USING (true);

-- Only admins can manage ranking points
CREATE POLICY "Only admins can insert ranking points"
    ON public.ranking_points
    FOR INSERT
    WITH CHECK (public.is_admin_check());

CREATE POLICY "Only admins can update ranking points"
    ON public.ranking_points
    FOR UPDATE
    USING (public.is_admin_check());

CREATE POLICY "Only admins can delete ranking points"
    ON public.ranking_points
    FOR DELETE
    USING (public.is_admin_check());

-- =====================================================
-- JUNCTION TABLES POLICIES
-- =====================================================

-- Junction tables inherit visibility from events
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

-- Org members can manage junction tables for their events
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
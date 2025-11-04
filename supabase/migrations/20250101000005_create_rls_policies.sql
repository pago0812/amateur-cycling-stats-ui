-- =====================================================
-- Migration 05: Row Level Security Policies
-- =====================================================
-- Creates helper functions and comprehensive RLS policies for all entities
-- Final version with organization-based access control
-- =====================================================

-- =====================================================
-- SECTION 1: Helper Functions for RLS
-- =====================================================

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
    WHERE e.id = event_id
      AND event_org.user_id = auth.uid()
  );
$$;

-- Check if user has organizer profile
CREATE OR REPLACE FUNCTION public.is_organizer()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organizers
    WHERE organizers.user_id = auth.uid()
  );
$$;

-- Check if user is organizer admin (not staff)
CREATE OR REPLACE FUNCTION public.is_organizer_admin()
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
    WHERE organizers.user_id = auth.uid()
      AND roles.name = 'organizer'
  );
$$;

-- Get user's organization ID (if they're an organizer)
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.organizers
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- =====================================================
-- SECTION 2: Enable RLS on All Tables
-- =====================================================

ALTER TABLE public.cyclists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.races ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranking_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_supported_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_supported_genders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_supported_lengths ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SECTION 3: Cyclists Table Policies
-- =====================================================

-- Everyone can view all cyclist profiles
CREATE POLICY "Cyclists are viewable by everyone"
  ON public.cyclists
  FOR SELECT
  TO public
  USING (true);

-- Users can insert their own cyclist profile (via trigger), Organizers can create any cyclist, Admin can insert any
CREATE POLICY "Users and organizers can insert cyclist profiles"
  ON public.cyclists
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR public.is_organizer()
    OR public.is_admin()
  );

-- Cyclists can update their own profile, Organizers can update any cyclist, Admins can update any
CREATE POLICY "Cyclists and organizers can update profiles"
  ON public.cyclists
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_organizer()
    OR public.is_admin()
  )
  WITH CHECK (
    auth.uid() = user_id
    OR public.is_organizer()
    OR public.is_admin()
  );

-- Only admins can delete cyclist profiles
CREATE POLICY "Only admins can delete cyclists"
  ON public.cyclists
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =====================================================
-- SECTION 4: Events Table Policies
-- =====================================================

-- Public can see public events, org members can see their org events, admin sees all
CREATE POLICY "Events are viewable based on visibility and organization"
  ON public.events
  FOR SELECT
  TO public
  USING (
    is_public_visible = true
    OR public.is_in_event_organization(id)
    OR public.is_admin()
  );

-- Organizers can create events for their organization
CREATE POLICY "Organizers can create events for their organization"
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

-- Organization members and admins can update events
CREATE POLICY "Organization members and admins can update events"
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

-- Organizer admins and system admins can delete events
CREATE POLICY "Organizer admins and system admins can delete events"
  ON public.events
  FOR DELETE
  TO authenticated
  USING (
    (
      public.is_in_event_organization(id)
      AND public.is_organizer_admin()
    )
    OR public.is_admin()
  );

-- =====================================================
-- SECTION 5: Races Table Policies
-- =====================================================

-- Public can see races if both race and parent event are public, org members see their org races, admin sees all
CREATE POLICY "Races are viewable based on visibility"
  ON public.races
  FOR SELECT
  TO public
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
    OR public.is_admin()
  );

-- Event organization members can create races
CREATE POLICY "Event organization members can create races"
  ON public.races
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_in_event_organization(event_id)
    OR public.is_admin()
  );

-- Event organization members can update races
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

-- Organizer admins and system admins can delete races
CREATE POLICY "Organizer admins and system admins can delete races"
  ON public.races
  FOR DELETE
  TO authenticated
  USING (
    (
      public.is_in_event_organization(event_id)
      AND public.is_organizer_admin()
    )
    OR public.is_admin()
  );

-- =====================================================
-- SECTION 6: Race Results Table Policies
-- =====================================================

-- Public can see results if race and event are public, org members see their org results, admin sees all
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

-- Org members of event's org (including staff) and admins can create results
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

-- Org members of event's org (including staff) and admins can update results
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

-- Only organizer admins of event's org and admins can delete results
CREATE POLICY "Organizer admins can delete race results"
  ON public.race_results
  FOR DELETE
  TO authenticated
  USING (
    (
      EXISTS (
        SELECT 1 FROM public.races
        WHERE races.id = race_results.race_id
          AND public.is_in_event_organization(races.event_id)
      )
      AND public.is_organizer_admin()
    )
    OR public.is_admin()
  );

-- =====================================================
-- SECTION 7: Ranking Points Table Policies
-- =====================================================

-- Everyone can view ranking points
CREATE POLICY "Ranking points are viewable by everyone"
  ON public.ranking_points
  FOR SELECT
  TO public
  USING (true);

-- Only admins can manage ranking points
CREATE POLICY "Only admins can insert ranking points"
  ON public.ranking_points
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update ranking points"
  ON public.ranking_points
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can delete ranking points"
  ON public.ranking_points
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =====================================================
-- SECTION 8: Junction Tables Policies
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
-- END OF MIGRATION 05
-- =====================================================

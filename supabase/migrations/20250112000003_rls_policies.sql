-- =====================================================
-- Migration 03: Row Level Security Policies
-- =====================================================
-- Comprehensive RLS policies for all tables
-- Implements organization-based access control with corrected permissions
-- See supabase/RLS_POLICIES.md for detailed documentation
-- =====================================================

-- =====================================================
-- SECTION 1: Enable RLS on All Tables
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
-- SECTION 2: Roles Table Policies
-- =====================================================
-- Authenticated users can view roles (needed for user profiles and nested queries)
-- Only admins can modify roles

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
-- SECTION 3: Users Table Policies
-- =====================================================

-- Everyone can view user profiles (needed for race results with cyclist names)
CREATE POLICY "Everyone can view user profiles"
  ON public.users
  FOR SELECT
  TO public
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Admins can do everything with users
CREATE POLICY "Admins can manage all users"
  ON public.users
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Organizers can insert unlinked users (for race results)
CREATE POLICY "Organizers can create unlinked users"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_organizer()
    AND auth_user_id IS NULL
  );

-- Organizers can update unlinked users created by their organization
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

-- Organizers can delete unlinked users created by their organization
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
-- SECTION 4: Organizations Table Policies
-- =====================================================

-- Public can view active organizations
CREATE POLICY "Public can view active organizations"
  ON public.organizations
  FOR SELECT
  TO public
  USING (is_active = true);

-- Admins can view all organizations (including inactive)
CREATE POLICY "Admins can view all organizations"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can insert organizations
CREATE POLICY "Admins can insert organizations"
  ON public.organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update any organization
CREATE POLICY "Admins can update any organization"
  ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Organizer owners can update their own organization
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

-- Note: Hard deletes are prevented to preserve data integrity
-- Organizations use soft delete (is_active = false) which is handled by UPDATE policies

-- =====================================================
-- SECTION 5: Organizers Table Policies
-- =====================================================

-- Users can view own organizer profile
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

-- Admins can view all organizer profiles
CREATE POLICY "Admins can view all organizers"
  ON public.organizers
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can manage all organizers
CREATE POLICY "Admins can manage all organizers"
  ON public.organizers
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Organizer owners can add organizers to their organization
CREATE POLICY "Organizer owners can add org organizers"
  ON public.organizers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_organizer_owner()
    AND organization_id = public.get_user_organization_id()
  );

-- Organizer owners can update organizers in their organization
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

-- Organizer owners can remove organizers from their organization
CREATE POLICY "Organizer owners can delete org organizers"
  ON public.organizers
  FOR DELETE
  TO authenticated
  USING (
    public.is_organizer_owner()
    AND organization_id = public.get_user_organization_id()
  );

-- Organizer staff can update their own profile
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
-- SECTION 6: Lookup Tables Policies (Public Read, Admin Write)
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
-- SECTION 7: Ranking Points Policies
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
-- SECTION 8: Cyclists Table Policies
-- =====================================================

-- Everyone can view all cyclist profiles
CREATE POLICY "Cyclists are viewable by everyone"
  ON public.cyclists
  FOR SELECT
  TO public
  USING (true);

-- Cyclists can insert their own profile (via trigger)
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

-- Organizers can create any cyclist
CREATE POLICY "Organizers can insert cyclist profiles"
  ON public.cyclists
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_organizer());

-- Admins can insert any cyclist
CREATE POLICY "Admins can insert cyclist profiles"
  ON public.cyclists
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Cyclists can update their own profile
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

-- Organizers can update cyclists created by their organization
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

-- Admins can update any cyclist
CREATE POLICY "Admins can update any cyclist"
  ON public.cyclists
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete any cyclist
CREATE POLICY "Admins can delete any cyclist"
  ON public.cyclists
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Organizers can delete only unlinked cyclists they created
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
-- SECTION 9: Events Table Policies
-- =====================================================

-- Public can see public events, org members see org events, admins see all
CREATE POLICY "Events are viewable based on visibility"
  ON public.events
  FOR SELECT
  TO public
  USING (
    is_public_visible = true
    OR public.is_in_event_organization(id)
    OR public.is_admin()
  );

-- Organizers can create events for their organization
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

-- Organization members can update their org's events
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

-- Organization members (both owner and staff) can delete their org's events
CREATE POLICY "Organization members can delete events"
  ON public.events
  FOR DELETE
  TO authenticated
  USING (
    public.is_in_event_organization(id)
    OR public.is_admin()
  );

-- =====================================================
-- SECTION 10: Races Table Policies
-- =====================================================

-- Public sees public races, org members see org races, admins see all
CREATE POLICY "Races are viewable based on visibility"
  ON public.races
  FOR SELECT
  TO public
  USING (
    is_public_visible = true
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

-- Event organization members (both owner and staff) can delete races
CREATE POLICY "Event organization members can delete races"
  ON public.races
  FOR DELETE
  TO authenticated
  USING (
    public.is_in_event_organization(event_id)
    OR public.is_admin()
  );

-- =====================================================
-- SECTION 11: Race Results Table Policies
-- =====================================================

-- Public sees results if race and event are public, org members see org results, admins see all
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

-- Org members (including staff) can create results
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

-- Org members (including staff) can update results
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

-- Org members (including staff) can delete results
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
-- SECTION 12: Junction Tables Policies
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
-- END OF MIGRATION 03
-- =====================================================

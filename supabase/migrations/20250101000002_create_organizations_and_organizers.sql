-- =====================================================
-- Migration 02: Organizations & Organizers
-- =====================================================
-- Creates organizations table and organizers junction table
-- Establishes many-to-many relationship between users and organizations
-- =====================================================

-- =====================================================
-- SECTION 1: Organizations Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attach updated_at trigger
DROP TRIGGER IF EXISTS handle_organizations_updated_at ON public.organizations;
CREATE TRIGGER handle_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SECTION 2: Organizers Junction Table
-- =====================================================
-- Links users to organizations (many-to-many relationship)
-- A user can belong to multiple organizations
-- An organization can have multiple organizers

CREATE TABLE IF NOT EXISTS public.organizers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- Attach updated_at trigger
DROP TRIGGER IF EXISTS handle_organizers_updated_at ON public.organizers;
CREATE TRIGGER handle_organizers_updated_at
  BEFORE UPDATE ON public.organizers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SECTION 3: Trigger for New Organizer Users
-- =====================================================
-- Log when new organizer/organizer_admin/organizer_staff users are created
-- Note: Does NOT auto-create organizer profile (must be done manually by admin)

CREATE OR REPLACE FUNCTION public.handle_new_organizer_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_role_name TEXT;
BEGIN
  -- Get the role name for the new user
  SELECT r.name INTO user_role_name
  FROM public.roles r
  WHERE r.id = NEW.role_id;

  -- Only log if user has an organizer-type role
  IF user_role_name IN ('organizer', 'organizer_admin', 'organizer_staff') THEN
    RAISE NOTICE 'New organizer user created: %', NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to users table
DROP TRIGGER IF EXISTS on_organizer_user_created ON public.users;
CREATE TRIGGER on_organizer_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_organizer_user();

-- =====================================================
-- SECTION 4: Row Level Security - Organizations
-- =====================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Public users can view all organizations
CREATE POLICY "Public can view organizations"
  ON public.organizations
  FOR SELECT
  TO public
  USING (true);

-- Authenticated users can view all organizations
CREATE POLICY "Authenticated can view organizations"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert organizations
CREATE POLICY "Only admins can insert organizations"
  ON public.organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Only admins can update organizations
CREATE POLICY "Only admins can update organizations"
  ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete organizations
CREATE POLICY "Only admins can delete organizations"
  ON public.organizations
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =====================================================
-- SECTION 5: Row Level Security - Organizers
-- =====================================================

ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;

-- Users can view their own organizer profiles
CREATE POLICY "Users can view own organizer profile"
  ON public.organizers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all organizer profiles
CREATE POLICY "Admins can view all organizer profiles"
  ON public.organizers
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Only admins can insert organizer profiles
CREATE POLICY "Only admins can insert organizers"
  ON public.organizers
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Only admins can update organizer profiles
CREATE POLICY "Only admins can update organizers"
  ON public.organizers
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete organizer profiles
CREATE POLICY "Only admins can delete organizers"
  ON public.organizers
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =====================================================
-- END OF MIGRATION 02
-- =====================================================

-- =====================================================
-- Consolidated Migration 02: Organization Invitations
-- =====================================================
-- Consolidates: Organization invitations table + state field + RPC update
-- Creates invitation system with state enum (WAITING_OWNER/ACTIVE/DISABLED)
-- =====================================================

-- =====================================================
-- SECTION 1: Organization Invitations Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id TEXT NOT NULL UNIQUE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_owner_name TEXT NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_invitation_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.organization_invitations IS 'Tracks pending owner invitations for organizations with retry mechanism';

-- Create indexes
CREATE INDEX idx_organization_invitations_email ON public.organization_invitations(email);
CREATE INDEX idx_organization_invitations_organization_id ON public.organization_invitations(organization_id);
CREATE INDEX idx_organization_invitations_status ON public.organization_invitations(status);

-- Trigger to auto-generate short_id
CREATE TRIGGER set_organization_invitations_short_id
  BEFORE INSERT ON public.organization_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_short_id();

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_organization_invitations_updated_at
  BEFORE UPDATE ON public.organization_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can read all invitations
CREATE POLICY "Admins can read all organization invitations"
  ON public.organization_invitations
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- RLS Policy: Admins can insert invitations
CREATE POLICY "Admins can insert organization invitations"
  ON public.organization_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- RLS Policy: Admins can update invitations
CREATE POLICY "Admins can update organization invitations"
  ON public.organization_invitations
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- RLS Policy: Admins can delete invitations
CREATE POLICY "Admins can delete organization invitations"
  ON public.organization_invitations
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =====================================================
-- SECTION 2: Replace is_active with state Enum
-- =====================================================

-- Drop RLS policies that depend on is_active column
DROP POLICY IF EXISTS "Public can view active organizations" ON public.organizations;

-- Create enum type for organization state
CREATE TYPE public.organization_state AS ENUM ('WAITING_OWNER', 'ACTIVE', 'DISABLED');

-- Add state column (nullable initially for data migration)
ALTER TABLE public.organizations
  ADD COLUMN state public.organization_state;

-- Migrate existing data: is_active = true -> ACTIVE, is_active = false -> DISABLED
UPDATE public.organizations
  SET state = CASE
    WHEN is_active = true THEN 'ACTIVE'::public.organization_state
    ELSE 'DISABLED'::public.organization_state
  END;

-- Make state column NOT NULL with default ACTIVE
ALTER TABLE public.organizations
  ALTER COLUMN state SET NOT NULL,
  ALTER COLUMN state SET DEFAULT 'ACTIVE'::public.organization_state;

-- Drop the old is_active column
ALTER TABLE public.organizations
  DROP COLUMN is_active;

-- Recreate RLS policy with new state column
CREATE POLICY "Public can view active organizations"
  ON public.organizations
  FOR SELECT
  TO public
  USING (state = 'ACTIVE');

COMMENT ON COLUMN public.organizations.state IS 'Organization state: WAITING_OWNER (pending owner invitation), ACTIVE (operational), DISABLED (inactive)';

-- =====================================================
-- SECTION 3: Update get_user_with_relations RPC
-- =====================================================

-- Update function to reference state field instead of is_active
CREATE OR REPLACE FUNCTION public.get_user_with_relations(user_short_id TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  target_user_id UUID;
  user_role_name TEXT;
BEGIN
  -- If short_id provided, lookup user ID
  IF user_short_id IS NOT NULL THEN
    SELECT id INTO target_user_id
    FROM public.users
    WHERE short_id = user_short_id
    LIMIT 1;
  ELSE
    -- Use authenticated user's auth.uid() to find their public user ID
    SELECT id INTO target_user_id
    FROM public.users
    WHERE auth_user_id = auth.uid()
    LIMIT 1;
  END IF;

  -- Return NULL if no user ID available
  IF target_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Get the user's role name for conditional logic
  SELECT r.name INTO user_role_name
  FROM public.users u
  JOIN public.roles r ON u.role_id = r.id
  WHERE u.id = target_user_id;

  -- Return NULL if user not found
  IF user_role_name IS NULL THEN
    RETURN NULL;
  END IF;

  -- Build the base user object with role
  SELECT jsonb_build_object(
    'id', u.id,
    'short_id', u.short_id,
    'first_name', u.first_name,
    'last_name', u.last_name,
    'role_id', u.role_id,
    'created_at', u.created_at,
    'updated_at', u.updated_at,
    'role', jsonb_build_object(
      'id', r.id,
      'short_id', r.short_id,
      'name', r.name,
      'created_at', r.created_at,
      'updated_at', r.updated_at
    ),
    'cyclist', CASE
      WHEN r.name = 'CYCLIST'::role_name_enum THEN (
        SELECT jsonb_build_object(
          'id', c.id,
          'short_id', c.short_id,
          'user_id', u.short_id,
          'born_year', c.born_year,
          'gender_id', c.gender_id,
          'created_at', c.created_at,
          'updated_at', c.updated_at
        )
        FROM public.cyclists c
        WHERE c.user_id = u.id
        LIMIT 1
      )
      ELSE NULL
    END,
    'organizer', CASE
      WHEN r.name IN ('ORGANIZER_STAFF'::role_name_enum, 'ORGANIZER_OWNER'::role_name_enum) THEN (
        SELECT jsonb_build_object(
          'id', o.id,
          'short_id', o.short_id,
          'user_id', u.short_id,
          'organization_id', o.organization_id,
          'created_at', o.created_at,
          'updated_at', o.updated_at,
          'organization', (
            SELECT jsonb_build_object(
              'id', org.id,
              'short_id', org.short_id,
              'name', org.name,
              'description', org.description,
              'state', org.state,
              'created_at', org.created_at,
              'updated_at', org.updated_at
            )
            FROM public.organizations org
            WHERE org.id = o.organization_id
          )
        )
        FROM public.organizers o
        WHERE o.user_id = u.id
        LIMIT 1
      )
      ELSE NULL
    END
  ) INTO result
  FROM public.users u
  JOIN public.roles r ON u.role_id = r.id
  WHERE u.id = target_user_id;

  RETURN result;
END;
$$;

COMMENT ON FUNCTION public.get_user_with_relations(TEXT) IS 'Returns enriched user data with first_name, last_name, role, and related entities (cyclist or organizer with organization). If no short_id provided, returns data for the authenticated user. Organization now returns state instead of is_active.';

-- =====================================================
-- END OF CONSOLIDATED MIGRATION 02
-- =====================================================

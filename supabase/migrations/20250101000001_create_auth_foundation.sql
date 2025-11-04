-- =====================================================
-- Migration 01: Auth Foundation
-- =====================================================
-- Creates roles, users tables, auth triggers, and RLS policies
-- Fixes auth.users NULL fields for proper authentication
-- =====================================================

-- =====================================================
-- SECTION 1: Roles Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed role data
INSERT INTO public.roles (name) VALUES
  ('public'),
  ('cyclist'),
  ('organizer_staff'),
  ('organizer'),
  ('admin')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SECTION 2: Users Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  role_id UUID REFERENCES public.roles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SECTION 3: Trigger Functions
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  cyclist_role_id UUID;
BEGIN
  -- Get the cyclist role ID
  SELECT id INTO cyclist_role_id FROM public.roles WHERE name = 'cyclist';

  -- Insert new user with cyclist role by default
  INSERT INTO public.users (id, username, role_id, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    cyclist_role_id,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Attach updated_at trigger to users table
DROP TRIGGER IF EXISTS handle_users_updated_at ON public.users;
CREATE TRIGGER handle_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SECTION 4: Helper Functions
-- =====================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.name
  FROM public.users u
  JOIN public.roles r ON u.role_id = r.id
  WHERE u.id = auth.uid();
$$;

-- Check if current user has specific role
CREATE OR REPLACE FUNCTION public.has_role(role_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid()
      AND r.name = role_name
  );
$$;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role('admin');
$$;

-- =====================================================
-- SECTION 5: Row Level Security - Roles Table
-- =====================================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Public read access to roles
CREATE POLICY "Public users can view roles"
  ON public.roles
  FOR SELECT
  TO public
  USING (true);

-- Only admins can insert roles
CREATE POLICY "Only admins can insert roles"
  ON public.roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Only admins can update roles
CREATE POLICY "Only admins can update roles"
  ON public.roles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete roles
CREATE POLICY "Only admins can delete roles"
  ON public.roles
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =====================================================
-- SECTION 6: Row Level Security - Users Table
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can view all user profiles
CREATE POLICY "Users can view all profiles"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete any profile
CREATE POLICY "Admins can delete any profile"
  ON public.users
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =====================================================
-- SECTION 7: Fix auth.users NULL Token Fields
-- =====================================================
-- Prevents "converting NULL to string is unsupported" errors during login
-- Updates all NULL token fields to empty strings

UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  recovery_sent_at = COALESCE(recovery_sent_at, NOW()),
  last_sign_in_at = COALESCE(last_sign_in_at, NOW())
WHERE
  confirmation_token IS NULL
  OR recovery_token IS NULL
  OR email_change_token_new IS NULL
  OR email_change_token_current IS NULL
  OR phone_change_token IS NULL
  OR reauthentication_token IS NULL
  OR recovery_sent_at IS NULL
  OR last_sign_in_at IS NULL;

-- =====================================================
-- END OF MIGRATION 01
-- =====================================================

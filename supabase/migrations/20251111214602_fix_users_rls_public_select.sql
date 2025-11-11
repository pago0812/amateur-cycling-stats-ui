-- =====================================================
-- Fix Users Table RLS Policy for Public Access
-- =====================================================
-- Users table should allow public SELECT for viewing cyclist names in race results
-- =====================================================

-- Drop the old authenticated-only policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;

-- Create new policy allowing public access to view user profiles
CREATE POLICY "Everyone can view user profiles"
  ON public.users
  FOR SELECT
  TO public
  USING (true);

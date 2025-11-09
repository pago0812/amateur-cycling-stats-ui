-- Add is_active column to organizations table for soft delete functionality
-- Migration: 20250108000001_add_organizations_is_active

-- Add is_active column with default true
ALTER TABLE organizations
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN organizations.is_active IS 'Soft delete flag - false means organization is inactive/deleted';

-- Update existing RLS policies to filter inactive organizations
-- Drop existing SELECT policy and recreate with is_active filter
DROP POLICY IF EXISTS "Public can view public organizations" ON organizations;
CREATE POLICY "Public can view active organizations"
  ON organizations
  FOR SELECT
  USING (is_active = true);

-- Drop and recreate admin policies to include is_active
DROP POLICY IF EXISTS "Admins can view all organizations" ON organizations;
CREATE POLICY "Admins can view all organizations including inactive"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role_id = (SELECT id FROM roles WHERE name = 'ADMIN')
    )
  );

-- Admins can update organizations (including soft delete by setting is_active = false)
DROP POLICY IF EXISTS "Admins can update organizations" ON organizations;
CREATE POLICY "Admins can update organizations"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role_id = (SELECT id FROM roles WHERE name = 'ADMIN')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role_id = (SELECT id FROM roles WHERE name = 'ADMIN')
    )
  );

-- Admins can insert organizations
DROP POLICY IF EXISTS "Admins can insert organizations" ON organizations;
CREATE POLICY "Admins can insert organizations"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role_id = (SELECT id FROM roles WHERE name = 'ADMIN')
    )
  );

-- Note: We don't allow hard deletes - only soft delete via is_active = false
-- This preserves data integrity for events linked to organizations

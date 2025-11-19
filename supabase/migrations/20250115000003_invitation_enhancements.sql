-- =====================================================
-- Consolidated Migration 03: Invitation Enhancements
-- =====================================================
-- Consolidates: Organizations delete policy + role-specific flows + invitation RLS consolidation
-- Implements skip_auto_create, role-specific RPCs, and invitation RLS policies
-- =====================================================

-- =====================================================
-- SECTION 1: Organizations Delete Policy
-- =====================================================

CREATE POLICY "Admins can delete organizations"
  ON public.organizations
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

COMMENT ON POLICY "Admins can delete organizations" ON public.organizations IS 'Admins can permanently delete organizations from the database';

-- =====================================================
-- SECTION 2: Role-Specific User Creation Flows
-- =====================================================

-- Modify handle_new_user() to support skipping auto-creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  cyclist_role_id UUID;
  user_first_name TEXT;
  user_last_name TEXT;
  skip_creation BOOLEAN;
BEGIN
  -- Check if auto-creation should be skipped (for manual role-specific creation)
  skip_creation := COALESCE((NEW.raw_user_meta_data->>'skip_auto_create')::BOOLEAN, FALSE);

  IF skip_creation THEN
    -- Skip automatic user creation, let RPC functions handle it
    RETURN NEW;
  END IF;

  -- Original logic: Get the cyclist role ID (default role)
  SELECT id INTO cyclist_role_id FROM public.roles WHERE name = 'CYCLIST'::role_name_enum;

  -- Extract first_name and last_name from metadata
  user_first_name := NEW.raw_user_meta_data->>'first_name';
  user_last_name := NEW.raw_user_meta_data->>'last_name';

  -- Fallback to email prefix if no names provided
  IF user_first_name IS NULL OR user_first_name = '' THEN
    user_first_name := SPLIT_PART(NEW.email, '@', 1);
  END IF;

  -- Insert new user with cyclist role by default
  INSERT INTO public.users (auth_user_id, first_name, last_name, role_id, created_at, updated_at)
  VALUES (
    NEW.id,
    user_first_name,
    user_last_name,
    cyclist_role_id,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates public.users record when auth.users is created. Can be skipped via skip_auto_create metadata flag.';

-- Create RPC function for creating organizer owner users
CREATE OR REPLACE FUNCTION public.create_user_with_organizer_owner(
  p_auth_user_id UUID,
  p_first_name TEXT,
  p_last_name TEXT,
  p_organization_id UUID
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_role_id UUID;
  v_user_id UUID;
BEGIN
  -- Get organizer_owner role ID
  SELECT id INTO v_role_id FROM public.roles WHERE name = 'ORGANIZER_OWNER'::role_name_enum;

  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'organizer_owner role not found';
  END IF;

  -- Check if user already exists
  SELECT id INTO v_user_id FROM public.users WHERE auth_user_id = p_auth_user_id;

  IF v_user_id IS NOT NULL THEN
    -- User exists (created by trigger), update role
    UPDATE public.users
    SET
      role_id = v_role_id,
      first_name = p_first_name,
      last_name = p_last_name,
      updated_at = NOW()
    WHERE id = v_user_id;

    -- Delete any auto-created cyclist profile
    DELETE FROM public.cyclists WHERE user_id = v_user_id;
  ELSE
    -- Create new user with organizer_owner role
    INSERT INTO public.users (auth_user_id, first_name, last_name, role_id, created_at, updated_at)
    VALUES (p_auth_user_id, p_first_name, p_last_name, v_role_id, NOW(), NOW())
    RETURNING id INTO v_user_id;
  END IF;

  -- Create organizer link to organization
  INSERT INTO public.organizers (user_id, organization_id, created_at, updated_at)
  VALUES (v_user_id, p_organization_id, NOW(), NOW())
  ON CONFLICT (user_id, organization_id) DO NOTHING;

  -- Return complete user data with relations
  RETURN public.get_auth_user(v_user_id);
END;
$$;

COMMENT ON FUNCTION public.create_user_with_organizer_owner IS 'Creates or updates a user with organizer_owner role and links them to an organization. Returns complete AuthUserRpcResponse structure.';

-- Create RPC function for completing organizer owner setup atomically
CREATE OR REPLACE FUNCTION public.complete_organizer_owner_setup(
  p_auth_user_id UUID,
  p_first_name TEXT,
  p_last_name TEXT,
  p_invitation_email TEXT
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_invitation_id UUID;
  v_organization_id UUID;
  v_user_id UUID;
BEGIN
  -- 1. Get and validate pending invitation
  SELECT id, organization_id
  INTO v_invitation_id, v_organization_id
  FROM public.organization_invitations
  WHERE email = p_invitation_email
    AND status = 'pending'
  LIMIT 1;

  IF v_invitation_id IS NULL THEN
    RAISE EXCEPTION 'No pending invitation found for email: %', p_invitation_email
      USING ERRCODE = '28000';
  END IF;

  -- 2. Update public.users (first_name, last_name)
  UPDATE public.users
  SET
    first_name = p_first_name,
    last_name = p_last_name,
    updated_at = NOW()
  WHERE auth_user_id = p_auth_user_id
  RETURNING id INTO v_user_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for auth_user_id: %', p_auth_user_id
      USING ERRCODE = '28000';
  END IF;

  -- 3. Link user to organization as organizer owner
  PERFORM public.create_user_with_organizer_owner(
    p_auth_user_id,
    p_first_name,
    p_last_name,
    v_organization_id
  );

  -- 4. Update invitation status to 'accepted'
  UPDATE public.organization_invitations
  SET
    status = 'accepted',
    updated_at = NOW()
  WHERE id = v_invitation_id;

  -- 5. Update organization state to ACTIVE
  UPDATE public.organizations
  SET
    state = 'ACTIVE',
    updated_at = NOW()
  WHERE id = v_organization_id;

  -- Return success with organization_id for redirect
  RETURN jsonb_build_object(
    'success', true,
    'organization_id', v_organization_id,
    'user_id', v_user_id
  );
END;
$$;

COMMENT ON FUNCTION public.complete_organizer_owner_setup IS 'Atomically completes organizer owner setup: updates user profile, links to organization, accepts invitation, and activates organization. Returns organization UUID for redirect. Password must be updated separately via Supabase Auth API.';

-- =====================================================
-- SECTION 3: Invited Users Can View WAITING_OWNER Organizations
-- =====================================================

-- Helper function to check if current user has an active invitation for an organization
-- Uses SECURITY DEFINER to bypass RLS when checking invitations
CREATE OR REPLACE FUNCTION public.user_has_active_invitation(org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_invitations oi
    JOIN auth.users au ON oi.email = au.email
    WHERE oi.organization_id = org_id
      AND au.id = auth.uid()
      AND oi.status IN ('pending', 'accepted')  -- Allow both pending (viewing) and accepted (completing setup)
  );
$$;

COMMENT ON FUNCTION public.user_has_active_invitation(UUID) IS 'Returns true if authenticated user has a pending or accepted invitation for the specified organization. Allows access during invitation flow and setup completion. Uses SECURITY DEFINER to bypass RLS.';

CREATE POLICY "Invited users can view organizations with active invitations"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (
    state = 'WAITING_OWNER'
    AND public.user_has_active_invitation(id)
  );

COMMENT ON POLICY "Invited users can view organizations with active invitations"
  ON public.organizations IS
  'Allows users with pending or accepted invitations to view organizations in WAITING_OWNER state during the invitation and complete-setup flow';

-- =====================================================
-- SECTION 4: Helper Functions for Invitation RLS
-- =====================================================

-- Helper function to check if current user's email matches given email
CREATE OR REPLACE FUNCTION public.current_user_email_matches(check_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users au
    WHERE au.id = auth.uid()
      AND au.email = check_email
  );
$$;

COMMENT ON FUNCTION public.current_user_email_matches(TEXT) IS 'Returns true if authenticated user email matches the provided email. Uses SECURITY DEFINER to access auth.users.';

-- Helper function to check if current user is a linked organizer owner
CREATE OR REPLACE FUNCTION public.is_linked_organizer_owner()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.auth_user_id = auth.uid()
      AND r.name = 'ORGANIZER_OWNER'::role_name_enum
      AND public.get_user_organization_id() IS NOT NULL  -- Has organizers record
  );
$$;

COMMENT ON FUNCTION public.is_linked_organizer_owner() IS 'Returns true if authenticated user has organizer_owner role and is linked to an organization (has organizers record). Used to distinguish between invitation flow (State A) and active owner (State B).';

-- =====================================================
-- SECTION 5: Consolidated Invitation RLS Policies
-- =====================================================

-- Drop old user-facing policies (keep admin policies)
DROP POLICY IF EXISTS "Users can read their own pending invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Users can accept their own pending invitations" ON public.organization_invitations;

-- State A: SELECT - Users can read their own pending invitations
CREATE POLICY "Invitation flow: Read own pending invitation"
  ON public.organization_invitations
  FOR SELECT
  TO authenticated
  USING (
    -- User's email matches invitation email
    public.current_user_email_matches(email)
    -- Invitation is still pending
    AND status = 'pending'
    -- User is NOT yet linked (invitation flow state)
    AND NOT public.is_linked_organizer_owner()
  );

COMMENT ON POLICY "Invitation flow: Read own pending invitation"
  ON public.organization_invitations IS
  'Allows users in invitation flow (State A: not yet linked) to read their own pending invitation during complete-setup process.';

-- State A: UPDATE - Users can accept their own pending invitations
CREATE POLICY "Invitation flow: Accept own pending invitation"
  ON public.organization_invitations
  FOR UPDATE
  TO authenticated
  USING (
    -- User's email matches invitation email
    public.current_user_email_matches(email)
    -- Invitation is still pending
    AND status = 'pending'
    -- User is NOT yet linked (invitation flow state)
    AND NOT public.is_linked_organizer_owner()
  )
  WITH CHECK (
    -- Can only change status to 'accepted'
    status = 'accepted'
  );

COMMENT ON POLICY "Invitation flow: Accept own pending invitation"
  ON public.organization_invitations IS
  'Allows users in invitation flow (State A: not yet linked) to accept their pending invitation. WITH CHECK ensures status can only be set to accepted.';

-- State A: DELETE - Users can delete/reject their own pending invitations
CREATE POLICY "Invitation flow: Delete own pending invitation"
  ON public.organization_invitations
  FOR DELETE
  TO authenticated
  USING (
    -- User's email matches invitation email
    public.current_user_email_matches(email)
    -- Invitation is still pending
    AND status = 'pending'
    -- User is NOT yet linked (invitation flow state)
    AND NOT public.is_linked_organizer_owner()
  );

COMMENT ON POLICY "Invitation flow: Delete own pending invitation"
  ON public.organization_invitations IS
  'Allows users in invitation flow (State A: not yet linked) to reject/cancel their own pending invitation.';

-- State B: SELECT - Linked owners can read all invitations for their organization
CREATE POLICY "Linked owner: Read organization invitations"
  ON public.organization_invitations
  FOR SELECT
  TO authenticated
  USING (
    -- User is a linked organizer owner
    public.is_linked_organizer_owner()
    -- Invitation belongs to user's organization
    AND organization_id = public.get_user_organization_id()
  );

COMMENT ON POLICY "Linked owner: Read organization invitations"
  ON public.organization_invitations IS
  'Allows linked organizer owners (State B: active owners) to read all invitations for their organization.';

-- State B: INSERT - Linked owners can create invitations for their organization
CREATE POLICY "Linked owner: Create organization invitations"
  ON public.organization_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User is a linked organizer owner
    public.is_linked_organizer_owner()
    -- New invitation must be for user's organization
    AND organization_id = public.get_user_organization_id()
  );

COMMENT ON POLICY "Linked owner: Create organization invitations"
  ON public.organization_invitations IS
  'Allows linked organizer owners (State B: active owners) to create new invitations for their organization.';

-- State B: UPDATE - Linked owners can update invitations for their organization
CREATE POLICY "Linked owner: Update organization invitations"
  ON public.organization_invitations
  FOR UPDATE
  TO authenticated
  USING (
    -- User is a linked organizer owner
    public.is_linked_organizer_owner()
    -- Invitation belongs to user's organization
    AND organization_id = public.get_user_organization_id()
  )
  WITH CHECK (
    -- Updated invitation must remain in user's organization
    public.is_linked_organizer_owner()
    AND organization_id = public.get_user_organization_id()
  );

COMMENT ON POLICY "Linked owner: Update organization invitations"
  ON public.organization_invitations IS
  'Allows linked organizer owners (State B: active owners) to update invitations for their organization (e.g., resend, expire).';

-- State B: DELETE - Linked owners can delete invitations for their organization
CREATE POLICY "Linked owner: Delete organization invitations"
  ON public.organization_invitations
  FOR DELETE
  TO authenticated
  USING (
    -- User is a linked organizer owner
    public.is_linked_organizer_owner()
    -- Invitation belongs to user's organization
    AND organization_id = public.get_user_organization_id()
  );

COMMENT ON POLICY "Linked owner: Delete organization invitations"
  ON public.organization_invitations IS
  'Allows linked organizer owners (State B: active owners) to delete invitations for their organization.';

-- =====================================================
-- END OF CONSOLIDATED MIGRATION 03
-- =====================================================

-- =====================================================
-- MIGRATION: Event Management RPC Functions
-- Feature: 001-event-management
-- Date: 2025-01-20
-- =====================================================
--
-- This migration adds RPC functions for event CRUD operations
-- in the organizer panel. All functions use RETURNS TABLE for
-- auto-generated TypeScript types and follow established patterns
-- from update_organization.
--
-- Functions:
-- 1. get_events_by_organization - List events with filters
-- 2. get_event_by_id - Get single event details
-- 3. create_event - Create new event with category combinations
-- 4. update_event - Partial update event
-- 5. delete_event - Delete event
-- =====================================================

-- =====================================================
-- SECTION 1: get_events_by_organization
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_events_by_organization(
  p_organization_id UUID,
  p_filter TEXT DEFAULT 'all'  -- 'all' | 'future' | 'past'
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  date_time TIMESTAMPTZ,
  event_status TEXT,
  year INT,
  country TEXT,
  state TEXT,
  city TEXT,
  is_public_visible BOOLEAN,
  created_by UUID,
  organization_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  race_count BIGINT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate caller has access to organization
  IF NOT EXISTS (
    SELECT 1 FROM public.organizers o
    JOIN public.users u ON o.user_id = u.id
    WHERE o.organization_id = p_organization_id
      AND u.auth_user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to organization %', p_organization_id
      USING ERRCODE = 'P0003';
  END IF;

  RETURN QUERY
  SELECT
    e.id,
    e.name,
    e.description,
    e.date_time,
    e.event_status,
    e.year,
    e.country,
    e.state,
    e.city,
    e.is_public_visible,
    e.created_by,
    e.organization_id,
    e.created_at,
    e.updated_at,
    COALESCE(COUNT(r.id), 0) AS race_count
  FROM public.events e
  LEFT JOIN public.races r ON e.id = r.event_id
  WHERE e.organization_id = p_organization_id
    AND (
      p_filter = 'all'
      OR (p_filter = 'future' AND (e.event_status IN ('DRAFT', 'AVAILABLE', 'SOLD_OUT', 'ON_GOING') OR e.date_time >= NOW()))
      OR (p_filter = 'past' AND (e.event_status = 'FINISHED' OR e.date_time < NOW()))
    )
  GROUP BY e.id
  ORDER BY
    CASE WHEN p_filter = 'future' THEN e.date_time END ASC,
    CASE WHEN p_filter != 'future' THEN e.date_time END DESC;
END;
$$;

COMMENT ON FUNCTION public.get_events_by_organization IS 'Returns events for an organization with race count. Supports filtering by "all", "future", or "past". Validates caller has organization access.';

-- =====================================================
-- SECTION 2: get_event_by_id
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_event_by_id(p_event_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  date_time TIMESTAMPTZ,
  event_status TEXT,
  year INT,
  country TEXT,
  state TEXT,
  city TEXT,
  is_public_visible BOOLEAN,
  created_by UUID,
  organization_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate event exists
  IF NOT EXISTS (SELECT 1 FROM public.events WHERE events.id = p_event_id) THEN
    RAISE EXCEPTION 'Event with ID % not found', p_event_id
      USING ERRCODE = 'P0002';
  END IF;

  -- Validate caller has access to event's organization
  IF NOT public.is_in_event_organization(p_event_id) THEN
    RAISE EXCEPTION 'Access denied to event %', p_event_id
      USING ERRCODE = 'P0003';
  END IF;

  RETURN QUERY
  SELECT
    e.id,
    e.name,
    e.description,
    e.date_time,
    e.event_status,
    e.year,
    e.country,
    e.state,
    e.city,
    e.is_public_visible,
    e.created_by,
    e.organization_id,
    e.created_at,
    e.updated_at
  FROM public.events e
  WHERE e.id = p_event_id;
END;
$$;

COMMENT ON FUNCTION public.get_event_by_id IS 'Returns single event by ID. Validates caller has organization access. Throws exception if not found or access denied.';

-- =====================================================
-- SECTION 3: create_event
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_event(
  p_name TEXT,
  p_description TEXT,
  p_date_time TIMESTAMPTZ,
  p_country TEXT,
  p_state TEXT,
  p_city TEXT,
  p_is_public_visible BOOLEAN,
  p_category_ids UUID[],
  p_gender_ids UUID[],
  p_length_ids UUID[]
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  date_time TIMESTAMPTZ,
  event_status TEXT,
  year INT,
  country TEXT,
  state TEXT,
  city TEXT,
  is_public_visible BOOLEAN,
  created_by UUID,
  organization_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id UUID;
  v_organization_id UUID;
  v_event_id UUID;
  v_year INT;
  v_category_id UUID;
  v_gender_id UUID;
  v_length_id UUID;
  v_race_name TEXT;
  v_category_name TEXT;
  v_gender_name TEXT;
  v_length_name TEXT;
BEGIN
  -- Get user ID and organization ID from auth context
  SELECT u.id, o.organization_id INTO v_user_id, v_organization_id
  FROM public.users u
  JOIN public.organizers o ON u.id = o.user_id
  WHERE u.auth_user_id = auth.uid()
  LIMIT 1;

  IF v_user_id IS NULL OR v_organization_id IS NULL THEN
    RAISE EXCEPTION 'User is not an organizer'
      USING ERRCODE = 'P0003';
  END IF;

  -- Validate at least one selection for each category type
  IF array_length(p_category_ids, 1) IS NULL OR array_length(p_category_ids, 1) = 0 THEN
    RAISE EXCEPTION 'At least one category must be selected'
      USING ERRCODE = 'P0001';
  END IF;

  IF array_length(p_gender_ids, 1) IS NULL OR array_length(p_gender_ids, 1) = 0 THEN
    RAISE EXCEPTION 'At least one gender must be selected'
      USING ERRCODE = 'P0001';
  END IF;

  IF array_length(p_length_ids, 1) IS NULL OR array_length(p_length_ids, 1) = 0 THEN
    RAISE EXCEPTION 'At least one length must be selected'
      USING ERRCODE = 'P0001';
  END IF;

  -- Extract year from date_time
  v_year := EXTRACT(YEAR FROM p_date_time)::INT;

  -- Create event
  INSERT INTO public.events (
    name, description, date_time, year, country, state, city,
    is_public_visible, event_status, created_by, organization_id
  )
  VALUES (
    p_name, p_description, p_date_time, v_year, p_country, p_state, p_city,
    p_is_public_visible, 'DRAFT', v_user_id, v_organization_id
  )
  RETURNING events.id INTO v_event_id;

  -- Insert category selections
  INSERT INTO public.event_supported_categories (event_id, race_category_id)
  SELECT v_event_id, unnest(p_category_ids);

  -- Insert gender selections
  INSERT INTO public.event_supported_genders (event_id, race_category_gender_id)
  SELECT v_event_id, unnest(p_gender_ids);

  -- Insert length selections
  INSERT INTO public.event_supported_lengths (event_id, race_category_length_id)
  SELECT v_event_id, unnest(p_length_ids);

  -- Generate races from cartesian product of categories × genders × lengths
  FOR v_category_id IN SELECT unnest(p_category_ids) LOOP
    FOR v_gender_id IN SELECT unnest(p_gender_ids) LOOP
      FOR v_length_id IN SELECT unnest(p_length_ids) LOOP
        -- Get names for race naming
        SELECT rc.name INTO v_category_name FROM public.race_categories rc WHERE rc.id = v_category_id;
        SELECT rcg.name INTO v_gender_name FROM public.race_category_genders rcg WHERE rcg.id = v_gender_id;
        SELECT rcl.name INTO v_length_name FROM public.race_category_lengths rcl WHERE rcl.id = v_length_id;

        -- Generate race name
        v_race_name := p_name || ', ' || COALESCE(v_category_name, '') || ', ' || COALESCE(v_gender_name, '') || ', ' || COALESCE(v_length_name, '');

        -- Insert race
        INSERT INTO public.races (
          name, event_id, race_category_id, race_category_gender_id, race_category_length_id, is_public_visible
        )
        VALUES (
          v_race_name, v_event_id, v_category_id, v_gender_id, v_length_id, false
        );
      END LOOP;
    END LOOP;
  END LOOP;

  -- Return created event
  RETURN QUERY
  SELECT
    e.id,
    e.name,
    e.description,
    e.date_time,
    e.event_status,
    e.year,
    e.country,
    e.state,
    e.city,
    e.is_public_visible,
    e.created_by,
    e.organization_id,
    e.created_at,
    e.updated_at
  FROM public.events e
  WHERE e.id = v_event_id;
END;
$$;

COMMENT ON FUNCTION public.create_event IS 'Creates a new event with category combinations and auto-generates races. Validates user is an organizer and has at least one selection per category type. Returns created event.';

-- =====================================================
-- SECTION 4: update_event
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_event(
  p_event_id UUID,
  p_updates JSONB
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  date_time TIMESTAMPTZ,
  event_status TEXT,
  year INT,
  country TEXT,
  state TEXT,
  city TEXT,
  is_public_visible BOOLEAN,
  created_by UUID,
  organization_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_new_date_time TIMESTAMPTZ;
  v_new_year INT;
BEGIN
  -- Validate event exists
  IF NOT EXISTS (SELECT 1 FROM public.events WHERE events.id = p_event_id) THEN
    RAISE EXCEPTION 'Event with ID % not found', p_event_id
      USING ERRCODE = 'P0002';
  END IF;

  -- Validate caller has access to event's organization
  IF NOT public.is_in_event_organization(p_event_id) THEN
    RAISE EXCEPTION 'Access denied to event %', p_event_id
      USING ERRCODE = 'P0003';
  END IF;

  -- Handle date_time update with year recalculation
  IF p_updates ? 'date_time' THEN
    v_new_date_time := (p_updates->>'date_time')::TIMESTAMPTZ;
    v_new_year := EXTRACT(YEAR FROM v_new_date_time)::INT;
  END IF;

  -- Return updated event
  RETURN QUERY
  UPDATE public.events e
  SET
    name = COALESCE((p_updates->>'name')::TEXT, e.name),
    description = CASE
      WHEN p_updates ? 'description' THEN (p_updates->>'description')::TEXT
      ELSE e.description
    END,
    date_time = COALESCE(v_new_date_time, e.date_time),
    year = COALESCE(v_new_year, e.year),
    country = COALESCE((p_updates->>'country')::TEXT, e.country),
    state = COALESCE((p_updates->>'state')::TEXT, e.state),
    city = CASE
      WHEN p_updates ? 'city' THEN (p_updates->>'city')::TEXT
      ELSE e.city
    END,
    event_status = COALESCE((p_updates->>'event_status')::TEXT, e.event_status),
    is_public_visible = COALESCE((p_updates->>'is_public_visible')::BOOLEAN, e.is_public_visible),
    updated_at = NOW()
  WHERE e.id = p_event_id
  RETURNING
    e.id,
    e.name,
    e.description,
    e.date_time,
    e.event_status,
    e.year,
    e.country,
    e.state,
    e.city,
    e.is_public_visible,
    e.created_by,
    e.organization_id,
    e.created_at,
    e.updated_at;
END;
$$;

COMMENT ON FUNCTION public.update_event IS 'Updates an event with partial data. Only fields present in p_updates JSONB are modified. Automatically recalculates year if date_time changes. Validates caller has organization access.';

-- =====================================================
-- SECTION 5: delete_event
-- =====================================================

CREATE OR REPLACE FUNCTION public.delete_event(p_event_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_event_status TEXT;
BEGIN
  -- Validate event exists
  SELECT event_status INTO v_event_status
  FROM public.events
  WHERE id = p_event_id;

  IF v_event_status IS NULL THEN
    RAISE EXCEPTION 'Event with ID % not found', p_event_id
      USING ERRCODE = 'P0002';
  END IF;

  -- Validate caller has access to event's organization
  IF NOT public.is_in_event_organization(p_event_id) THEN
    RAISE EXCEPTION 'Access denied to event %', p_event_id
      USING ERRCODE = 'P0003';
  END IF;

  -- Validate event can be deleted (only DRAFT status)
  IF v_event_status != 'DRAFT' THEN
    RAISE EXCEPTION 'Cannot delete event with status %. Only DRAFT events can be deleted.', v_event_status
      USING ERRCODE = 'P0001';
  END IF;

  -- Delete event (CASCADE will delete races, junction tables)
  DELETE FROM public.events WHERE id = p_event_id;

  RETURN true;
END;
$$;

COMMENT ON FUNCTION public.delete_event IS 'Deletes an event by ID. Only DRAFT events can be deleted. Validates caller has organization access. Returns true on success.';

-- =====================================================
-- END OF EVENT MANAGEMENT RPC FUNCTIONS
-- =====================================================

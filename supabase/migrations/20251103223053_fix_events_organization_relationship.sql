-- =====================================================
-- FIX: Events should link to Organization, not Organizer
-- =====================================================
-- Events are owned by Organizations, not individual Organizers
-- created_by tracks which user created it (for audit)
-- organization_id tracks which organization owns/manages it

-- Drop policies that reference organizer_id
DROP POLICY IF EXISTS "Organizers can create events" ON public.events;
DROP POLICY IF EXISTS "Event organizers and admins can update events" ON public.events;
DROP POLICY IF EXISTS "Event organizers and admins can delete events" ON public.events;
DROP POLICY IF EXISTS "Event organizers and admins can delete races" ON public.races;

-- Drop the organizer_id column
ALTER TABLE public.events DROP COLUMN IF EXISTS organizer_id;

-- Add organization_id back to events
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS events_organization_id_idx ON public.events(organization_id);

COMMENT ON COLUMN public.events.organization_id IS 'Organization that owns/manages this event';
COMMENT ON COLUMN public.events.created_by IS 'User who created the event (for audit trail)';

-- Drop and recreate the is_organizer_of_event function (no longer needed)
DROP FUNCTION IF EXISTS public.is_organizer_of_event(UUID);

-- Recreate events policies with organization-based logic
CREATE POLICY "Organizers can create events for their organization"
    ON public.events
    FOR INSERT
    WITH CHECK (
        (
            public.is_organizer()
            AND organization_id = public.get_user_organization_id()
        )
        OR public.is_admin_check()
    );

CREATE POLICY "Organization members and admins can update events"
    ON public.events
    FOR UPDATE
    USING (
        public.is_in_event_organization(id)
        OR public.is_admin_check()
    );

CREATE POLICY "Organizer admins and system admins can delete events"
    ON public.events
    FOR DELETE
    USING (
        (
            public.is_in_event_organization(id)
            AND public.is_organizer_admin()
        )
        OR public.is_admin_check()
    );

-- Fix races DELETE policy to use organization logic
CREATE POLICY "Organizer admins and system admins can delete races"
    ON public.races
    FOR DELETE
    USING (
        (
            public.is_in_event_organization(event_id)
            AND public.is_organizer_admin()
        )
        OR public.is_admin_check()
    );
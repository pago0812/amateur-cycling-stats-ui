-- =====================================================
-- ORGANIZATIONS TABLE
-- =====================================================
-- Organizations group organizers and staff together
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.organizations IS 'Organizations that group event organizers and staff together';

-- Add updated_at trigger
CREATE TRIGGER set_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- UPDATE USERS TABLE - Add organization_id
-- =====================================================
-- Add organization_id to link organizers and staff to their organization
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.users.organization_id IS 'Organization the user belongs to (only for organizers and staff)';

-- Create index for organization lookups
CREATE INDEX IF NOT EXISTS users_organization_id_idx ON public.users(organization_id);

-- =====================================================
-- RLS POLICIES FOR ORGANIZATIONS
-- =====================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Everyone can view all organizations
CREATE POLICY "Organizations are viewable by everyone"
    ON public.organizations
    FOR SELECT
    USING (true);

-- Only admins can create organizations
CREATE POLICY "Only admins can create organizations"
    ON public.organizations
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role_id IN (SELECT id FROM public.roles WHERE type = 'admin')
        )
    );

-- Admins and organizer admins of that org can update
CREATE POLICY "Admins and org admins can update organizations"
    ON public.organizations
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            JOIN public.roles ON users.role_id = roles.id
            WHERE users.id = auth.uid()
            AND (
                roles.type = 'admin'
                OR (roles.type = 'organizer' AND users.organization_id = organizations.id)
            )
        )
    );

-- Only admins can delete organizations
CREATE POLICY "Only admins can delete organizations"
    ON public.organizations
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role_id IN (SELECT id FROM public.roles WHERE type = 'admin')
        )
    );
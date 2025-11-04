-- =====================================================
-- ROLES LOOKUP TABLE
-- =====================================================
-- Create roles table to store available user roles
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    type TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comment to roles table
COMMENT ON TABLE public.roles IS 'Lookup table for user roles and permissions';

-- Insert the 5 role types
INSERT INTO public.roles (name, description, type) VALUES
    ('Public', 'Unauthenticated users with read-only access to public content', 'public'),
    ('Cyclist', 'Registered cyclists who can manage their profile and register for events', 'cyclist'),
    ('Organizer Staff', 'Event organizers with limited administrative access', 'organizer_staff'),
    ('Organizer Admin', 'Event organizers with full administrative access', 'organizer'),
    ('Admin', 'System administrators with full access to all features', 'admin');

-- =====================================================
-- USERS/PROFILES TABLE
-- =====================================================
-- Create users table (also called profiles) linked to Supabase auth.users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comments to users table
COMMENT ON TABLE public.users IS 'User profiles linked to Supabase Auth, stores additional user metadata';
COMMENT ON COLUMN public.users.id IS 'Foreign key to auth.users, automatically set on signup';
COMMENT ON COLUMN public.users.username IS 'Unique username chosen by the user';
COMMENT ON COLUMN public.users.role_id IS 'Foreign key to roles table, defaults to CYCLIST role';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS users_role_id_idx ON public.users(role_id);
CREATE INDEX IF NOT EXISTS users_username_idx ON public.users(username);

-- =====================================================
-- AUTO-UPDATE TIMESTAMP TRIGGER
-- =====================================================
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to roles table
CREATE TRIGGER set_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Apply trigger to users table
CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- =====================================================
-- Function to automatically create a user profile with CYCLIST role when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    cyclist_role_id UUID;
BEGIN
    -- Get the CYCLIST role ID
    SELECT id INTO cyclist_role_id FROM public.roles WHERE type = 'cyclist' LIMIT 1;

    -- Create user profile with CYCLIST as default role
    INSERT INTO public.users (id, username, role_id)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        cyclist_role_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user() when a new user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on roles table
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ==================
-- ROLES TABLE POLICIES
-- ==================

-- Policy: Anyone (including public) can read all roles
CREATE POLICY "Roles are viewable by everyone"
    ON public.roles
    FOR SELECT
    USING (true);

-- Policy: Only admins can insert roles
CREATE POLICY "Only admins can insert roles"
    ON public.roles
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role_id IN (SELECT id FROM public.roles WHERE type = 'admin')
        )
    );

-- Policy: Only admins can update roles
CREATE POLICY "Only admins can update roles"
    ON public.roles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role_id IN (SELECT id FROM public.roles WHERE type = 'admin')
        )
    );

-- Policy: Only admins can delete roles
CREATE POLICY "Only admins can delete roles"
    ON public.roles
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role_id IN (SELECT id FROM public.roles WHERE type = 'admin')
        )
    );

-- ==================
-- USERS TABLE POLICIES
-- ==================

-- Policy: Anyone (including public) can read all user profiles
CREATE POLICY "User profiles are viewable by everyone"
    ON public.users
    FOR SELECT
    USING (true);

-- Policy: Users can insert their own profile (handled by trigger, but keeping for manual cases)
CREATE POLICY "Users can insert their own profile"
    ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own username
CREATE POLICY "Users can update their own username"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND (role_id = (SELECT role_id FROM public.users WHERE id = auth.uid()))
    );

-- Policy: Only admins and organizer admins can update user roles
CREATE POLICY "Admins and organizer admins can update user roles"
    ON public.users
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role_id IN (
                SELECT id FROM public.roles
                WHERE type IN ('admin', 'organizer')
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role_id IN (
                SELECT id FROM public.roles
                WHERE type IN ('admin', 'organizer')
            )
        )
    );

-- Policy: Only admins can delete users
CREATE POLICY "Only admins can delete users"
    ON public.users
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role_id IN (SELECT id FROM public.roles WHERE type = 'admin')
        )
    );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get current user's role type
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
    SELECT roles.type
    FROM public.users
    JOIN public.roles ON users.role_id = roles.id
    WHERE users.id = auth.uid()
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if current user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(role_type TEXT)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.users
        JOIN public.roles ON users.role_id = roles.id
        WHERE users.id = auth.uid()
        AND roles.type = role_type
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.users
        JOIN public.roles ON users.role_id = roles.id
        WHERE users.id = auth.uid()
        AND roles.type = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER;
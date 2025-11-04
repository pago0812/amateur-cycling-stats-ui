-- =====================================================
-- GET USER WITH RELATIONS FUNCTION
-- =====================================================
-- Function to get enriched user data including role and related entities (cyclist or organizer)
-- This replaces the previous REST API call pattern and consolidates user data fetching

CREATE OR REPLACE FUNCTION public.get_user_with_relations(user_uuid UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    target_user_id UUID;
    user_role_type TEXT;
BEGIN
    -- If no UUID provided, use the authenticated user's ID
    target_user_id := COALESCE(user_uuid, auth.uid());

    -- Return NULL if no user ID available
    IF target_user_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Get the user's role type for conditional logic
    SELECT r.type INTO user_role_type
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = target_user_id;

    -- Return NULL if user not found
    IF user_role_type IS NULL THEN
        RETURN NULL;
    END IF;

    -- Build the base user object with role
    SELECT jsonb_build_object(
        'id', u.id,
        'username', u.username,
        'role_id', u.role_id,
        'created_at', u.created_at,
        'updated_at', u.updated_at,
        'role', jsonb_build_object(
            'id', r.id,
            'name', r.name,
            'type', r.type,
            'description', r.description
        ),
        'cyclist', CASE
            WHEN r.type = 'cyclist' THEN (
                SELECT jsonb_build_object(
                    'id', c.id,
                    'user_id', c.user_id,
                    'name', c.name,
                    'last_name', c.last_name,
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
            WHEN r.type IN ('organizer_staff', 'organizer') THEN (
                SELECT jsonb_build_object(
                    'id', o.id,
                    'user_id', o.user_id,
                    'organization_id', o.organization_id,
                    'created_at', o.created_at,
                    'updated_at', o.updated_at,
                    'organization', (
                        SELECT jsonb_build_object(
                            'id', org.id,
                            'name', org.name,
                            'email', org.email,
                            'phone', org.phone,
                            'website', org.website,
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION public.get_user_with_relations IS 'Returns enriched user data with role and related entities (cyclist or organizer with organization). If no UUID provided, returns data for the authenticated user.';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_with_relations TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_with_relations TO anon;

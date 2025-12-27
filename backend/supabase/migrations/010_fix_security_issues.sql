-- Migration to fix security issues detected by Supabase Database Linter
-- 
-- Issues addressed:
-- 1. auth_users_exposed: admin_user_view exposes auth.users to anon role
-- 2. security_definer_view: admin_user_view uses SECURITY DEFINER
-- 3. rls_disabled_in_public: contact_leads table doesn't have RLS enabled

-- ============================================================================
-- PART 1: Fix admin_user_view security issues
-- ============================================================================

-- Drop the insecure admin_user_view if it exists
-- This view was exposing auth.users data to anon/authenticated roles
DROP VIEW IF EXISTS public.admin_user_view CASCADE;

-- Note: The application should use Supabase Admin API instead of direct views
-- to access auth.users data. This is already implemented in:
-- - backend/app/api/v1/routes/admin/users.py
-- The Admin API uses service_role_key which is more secure than exposing views

-- ============================================================================
-- PART 2: Enable RLS on contact_leads table
-- ============================================================================

-- Enable Row Level Security on contact_leads
ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone (anon) can INSERT contact leads (for contact form submissions)
-- This allows unauthenticated users to submit contact forms
DROP POLICY IF EXISTS "Anyone can submit contact leads" ON public.contact_leads;
CREATE POLICY "Anyone can submit contact leads" ON public.contact_leads
    FOR INSERT
    WITH CHECK (true);

-- Policy 2: Users can view their own contact leads (if they have a user_id)
-- This is useful if a user submits a contact form while logged in
DROP POLICY IF EXISTS "Users view own contact leads" ON public.contact_leads;
CREATE POLICY "Users view own contact leads" ON public.contact_leads
    FOR SELECT
    USING (
        -- Allow if user is viewing their own lead (if converted_to_user_id matches)
        converted_to_user_id = auth.uid()
        OR
        -- Allow if the lead was created by the current user (if we track creator)
        -- Note: This assumes we might add a created_by_user_id column in the future
        -- For now, we'll rely on converted_to_user_id
        false
    );

-- Policy 3: Admins have full access to contact leads
-- This allows admins to view, update, and manage all contact leads
DROP POLICY IF EXISTS "Admins full access contact leads" ON public.contact_leads;
CREATE POLICY "Admins full access contact leads" ON public.contact_leads
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy 4: Admins can update contact leads (for status changes, notes, etc.)
-- This is already covered by the "Admins full access" policy above,
-- but we can add a specific UPDATE policy if needed for clarity
DROP POLICY IF EXISTS "Admins can update contact leads" ON public.contact_leads;
CREATE POLICY "Admins can update contact leads" ON public.contact_leads
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- PART 3: Additional security improvements
-- ============================================================================

-- Create a secure function to check if a user is an admin
-- This can be reused across multiple policies
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = user_id AND role = 'admin'
    );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- Add comment explaining the security model
COMMENT ON TABLE public.contact_leads IS 
    'Contact form submissions. RLS enabled: anon can INSERT, admins have full access.';

COMMENT ON FUNCTION public.is_admin(UUID) IS 
    'Helper function to check if a user has admin role. Uses SECURITY DEFINER for efficiency.';

-- ============================================================================
-- VERIFICATION QUERIES (for manual testing)
-- ============================================================================

-- To verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_leads';

-- To verify policies exist:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'contact_leads';

-- To verify the view is dropped:
-- SELECT table_name FROM information_schema.views 
-- WHERE table_schema = 'public' AND table_name = 'admin_user_view';
-- (Should return no rows)


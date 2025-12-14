-- SQL script to create admin user in Supabase
-- This script should be run in Supabase SQL Editor
-- Note: You'll need to create the auth user first via Supabase Dashboard or API

-- Step 1: Create the user in auth.users (if not exists)
-- This must be done via Supabase Dashboard > Authentication > Users > Add User
-- OR via the Supabase Admin API
-- Email: admin@primo-store.com
-- Password: Admin@123
-- Auto-confirm: Yes

-- Step 2: After creating the user, get their user_id and run this:
-- Replace 'USER_ID_HERE' with the actual user ID from auth.users

-- Update or insert user profile with admin role
INSERT INTO public.user_profiles (id, name, role, created_at, updated_at)
VALUES (
    'USER_ID_HERE',  -- Replace with actual user ID
    'Admin User',
    'admin',
    NOW(),
    NOW()
)
ON CONFLICT (id) 
DO UPDATE SET 
    name = 'Admin User',
    role = 'admin',
    updated_at = NOW();

-- Alternative: If you already have a user and want to make them admin
-- UPDATE public.user_profiles 
-- SET role = 'admin' 
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@primo-store.com');

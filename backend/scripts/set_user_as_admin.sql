-- Quick SQL script to set a user as admin
-- Run this in Supabase SQL Editor after creating the user in Authentication

-- Option 1: Set user as admin by email
UPDATE public.user_profiles 
SET 
    role = 'admin',
    updated_at = NOW()
WHERE id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'admin@primo-store.com'
);

-- Option 2: If user profile doesn't exist, create it
-- Replace 'USER_ID_HERE' with the actual user ID from auth.users
INSERT INTO public.user_profiles (id, name, role, created_at, updated_at)
SELECT 
    id,
    COALESCE((raw_user_meta_data->>'name')::text, 'Admin User'),
    'admin',
    NOW(),
    NOW()
FROM auth.users
WHERE email = 'admin@primo-store.com'
AND NOT EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = auth.users.id
)
ON CONFLICT (id) 
DO UPDATE SET 
    role = 'admin',
    updated_at = NOW();

-- Verify the admin user was created
SELECT 
    u.email,
    up.name,
    up.role,
    u.created_at
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
WHERE u.email = 'admin@primo-store.com';

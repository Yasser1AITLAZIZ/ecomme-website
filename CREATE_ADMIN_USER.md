# How to Create Admin User for Admin Dashboard

This guide explains how to create admin credentials to access the admin dashboard.

## Method 1: Using Supabase Dashboard (Recommended)

### Step 1: Create User in Supabase Authentication

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Users**
3. Click **"Add User"** or **"Create User"**
4. Fill in the following:
   - **Email**: `admin@primo-store.com`
   - **Password**: `Admin@123` (or choose a strong password)
   - **Auto Confirm User**: ✅ Check this box (important!)
5. Click **"Create User"**
6. **Copy the User ID** that is displayed (you'll need it for Step 2)

### Step 2: Update User Profile to Admin Role

1. Go to **SQL Editor** in Supabase Dashboard
2. Run the following SQL query, replacing `USER_ID_HERE` with the User ID from Step 1:

```sql
-- Create or update user profile with admin role
INSERT INTO public.user_profiles (id, name, role, created_at, updated_at)
VALUES (
    'USER_ID_HERE',  -- Replace with the User ID from Step 1
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
```

3. Click **"Run"** to execute the query

### Step 3: Verify Admin User

Run this query to verify the admin user was created:

```sql
SELECT 
    u.email,
    up.name,
    up.role
FROM auth.users u
JOIN public.user_profiles up ON u.id = up.id
WHERE u.email = 'admin@primo-store.com';
```

You should see:
- email: `admin@primo-store.com`
- name: `Admin User`
- role: `admin`

## Method 2: Using Python Script

If you have Python installed and your backend environment configured:

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run the script:
   ```bash
   python scripts/create_admin_user.py
   ```

   Or if you use `python3`:
   ```bash
   python3 scripts/create_admin_user.py
   ```

The script will:
- Create the user in Supabase Auth
- Create/update the user profile with admin role
- Display the credentials

## Method 3: Using Existing User

If you already have a user account and want to make it admin:

1. Go to Supabase SQL Editor
2. Run this query (replace the email with your user's email):

```sql
UPDATE public.user_profiles 
SET role = 'admin',
    updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```

## Login Credentials

After creating the admin user, you can log in to the admin dashboard:

- **URL**: `http://localhost:3000/admin/dashboard`
- **Email**: `admin@primo-store.com`
- **Password**: `Admin@123` (or the password you set)

## Security Notes

⚠️ **IMPORTANT**: 
- Change the default password after first login
- Use a strong password in production
- Never commit admin credentials to version control
- Consider using environment variables for admin credentials in production

## Troubleshooting

### User can't access admin routes
- Verify the user has `role = 'admin'` in `user_profiles` table
- Check that the user is logged in (has a valid session)
- Ensure the frontend is checking the role correctly

### User profile not found
- Make sure the user profile was created with the same `id` as the auth user
- Check that the `user_profiles` table exists and has the correct schema

### Can't create user via Supabase Dashboard
- Ensure you have admin access to the Supabase project
- Check that Authentication is enabled in your Supabase project
- Verify your Supabase project is active

## Quick SQL to Check All Admin Users

```sql
SELECT 
    u.email,
    up.name,
    up.role,
    u.created_at
FROM auth.users u
JOIN public.user_profiles up ON u.id = up.id
WHERE up.role = 'admin';
```

# Admin Dashboard Credentials

## ✅ Admin User Created Successfully!

Your admin user has been set up and is ready to use.

### Current Admin Credentials

**Email**: `aitlaziz.studentacc@gmail.com`  
**Role**: `admin` ✅  
**Status**: Active and ready to use

### How to Access Admin Dashboard

1. **Start your frontend server** (if not already running):
   ```bash
   cd frontend
   npm run dev
   ```

2. **Navigate to the admin dashboard**:
   - URL: `http://localhost:3000/admin/dashboard`
   - Or: `http://localhost:3000/admin` (will redirect to dashboard)

3. **Log in with your credentials**:
   - Email: `aitlaziz.studentacc@gmail.com`
   - Password: (Your existing password for this account)

### Create Additional Admin User (Optional)

If you want to create a dedicated admin account (`admin@primo-store.com`):

#### Step 1: Create User in Supabase Dashboard
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Enter:
   - Email: `admin@primo-store.com`
   - Password: `Admin@123` (or your preferred password)
   - ✅ Check "Auto Confirm User"
4. Click "Create User"

#### Step 2: Set as Admin (Run in SQL Editor)
```sql
SELECT promote_user_to_admin('admin@primo-store.com');
```

Or manually:
```sql
UPDATE public.user_profiles 
SET role = 'admin', updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@primo-store.com');
```

### Verify Admin Access

Run this SQL to see all admin users:
```sql
SELECT 
    u.email,
    up.name,
    up.role,
    u.email_confirmed_at
FROM auth.users u
JOIN public.user_profiles up ON u.id = up.id
WHERE up.role = 'admin';
```

### Security Notes

⚠️ **Important**:
- Change your password regularly
- Use strong passwords
- Never share admin credentials
- Consider using 2FA in production

### Troubleshooting

**Can't access admin routes?**
- Verify your user has `role = 'admin'` in `user_profiles` table
- Make sure you're logged in
- Check browser console for errors

**User not found?**
- Ensure you're using the correct email
- Check that the user exists in `auth.users` table
- Verify the profile exists in `user_profiles` table

### Quick SQL Commands

**Promote any user to admin:**
```sql
SELECT promote_user_to_admin('user@example.com');
```

**Check all admin users:**
```sql
SELECT u.email, up.role 
FROM auth.users u 
JOIN public.user_profiles up ON u.id = up.id 
WHERE up.role = 'admin';
```

**Demote admin to customer:**
```sql
UPDATE public.user_profiles 
SET role = 'customer' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

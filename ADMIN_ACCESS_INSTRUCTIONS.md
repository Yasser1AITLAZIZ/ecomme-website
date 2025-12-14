# How to Access Admin Dashboard

## ✅ Your Admin Account is Ready!

Your account has been successfully set up as an admin:
- **Email**: `aitlaziz.studentacc@gmail.com`
- **Role**: `admin` ✅

## 🔑 Steps to Access Admin Dashboard

### Step 1: Log Out (Important!)

Since your account was just updated to admin, you need to refresh your session:

1. **Click on your name** in the top right corner of the website
2. **Click "Logout"** or navigate to `/logout`
3. This will clear your current session

### Step 2: Log Back In

1. Go to the login page: `http://localhost:3000/login`
2. Enter your credentials:
   - **Email**: `aitlaziz.studentacc@gmail.com`
   - **Password**: (Your existing password)
3. Click "Sign In"

### Step 3: Access Admin Dashboard

After logging in, you can access the admin dashboard in two ways:

**Option 1**: Direct URL
```
http://localhost:3000/admin/dashboard
```

**Option 2**: Navigate to `/admin` (will redirect to dashboard)
```
http://localhost:3000/admin
```

## 🎯 What You'll See

Once you access the admin dashboard, you'll see:

- **Sidebar Navigation** with:
  - Dashboard
  - Products
  - Orders
  - Users
  - Categories
  - Analytics
  - Settings
  - Audit Logs
  - Security

- **Dashboard** with:
  - Revenue statistics
  - Order counts
  - User statistics
  - Product statistics
  - Charts and graphs

## ⚠️ Troubleshooting

### "Access Denied" or Redirected to Home

If you're redirected to the home page when trying to access `/admin`:

1. **Make sure you logged out and logged back in** after the role was updated
2. **Check your browser console** for any errors
3. **Verify your role** by running this SQL in Supabase:
   ```sql
   SELECT u.email, up.role 
   FROM auth.users u 
   JOIN public.user_profiles up ON u.id = up.id 
   WHERE u.email = 'aitlaziz.studentacc@gmail.com';
   ```
   You should see `role = 'admin'`

### Still Can't Access?

If you still can't access after logging out and back in:

1. **Clear your browser cache and cookies**
2. **Try in an incognito/private window**
3. **Check that the frontend server is running**: `npm run dev` in the `frontend` directory
4. **Check that the backend server is running**: `uvicorn app.main:app --reload` in the `backend` directory

### Verify Admin Status

To verify your admin status in the database:

```sql
-- Check your admin status
SELECT 
    u.email,
    up.name,
    up.role,
    u.email_confirmed_at
FROM auth.users u
JOIN public.user_profiles up ON u.id = up.id
WHERE u.email = 'aitlaziz.studentacc@gmail.com';
```

You should see:
- `email`: `aitlaziz.studentacc@gmail.com`
- `role`: `admin` ✅

## 📝 Quick Reference

**Admin Dashboard URL**: `http://localhost:3000/admin/dashboard`

**Your Credentials**:
- Email: `aitlaziz.studentacc@gmail.com`
- Password: (Your existing password)

**Important**: You must log out and log back in after the role update to refresh your session!

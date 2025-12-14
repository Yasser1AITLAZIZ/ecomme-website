# Backend Scripts

This directory contains utility scripts for backend operations.

## Available Scripts

### `create_demo_user.py`

Creates a demo user account for testing purposes.

**Usage:**
```bash
cd backend
python scripts/create_demo_user.py
```

**What it does:**
- Creates a demo user with:
  - Email: `demo@example.com`
  - Password: `demo123`
  - Name: "Demo User"
- Auto-confirms the email (no confirmation needed)
- Creates a user profile in the database
- Checks if the user already exists before creating

**Requirements:**
- `.env` file with correct Supabase credentials:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

**Output:**
- Success message with user details if created
- Error message if creation fails
- Skips creation if user already exists

**Example Output:**
```
==================================================
Demo User Creation Script
==================================================

Creating demo user: demo@example.com...
✅ Demo user created successfully!
   Email: demo@example.com
   Password: demo123
   User ID: 12345678-1234-1234-1234-123456789abc
✅ User profile created successfully!

✅ Script completed successfully!

You can now log in with:
   Email: demo@example.com
   Password: demo123
```

### `migrate.py`

Migration runner script (prints instructions for manual migration execution).

**Usage:**
```bash
cd backend
python scripts/migrate.py
```

**Note:** This script currently prints instructions. Migrations should be run manually in Supabase SQL Editor.

---

## Troubleshooting

### Demo User Creation Fails

**Error: "Error connecting to Supabase"**
- Check that `SUPABASE_URL` is correct in `.env`
- Verify internet connection

**Error: "Failed to create demo user: Invalid API key"**
- Check that `SUPABASE_SERVICE_ROLE_KEY` is correct in `.env`
- Ensure you're using the service role key, not the anon key

**Error: "User profile creation failed"**
- This is usually not critical - the user is created in Auth
- You can manually create the profile in Supabase Dashboard if needed

### Email Domain Issues

If you see errors about `@example.com` being invalid:
- Supabase blocks `@example.com` by default
- Use a real email domain for testing, or
- Configure Supabase Auth settings to allow `@example.com` (development only)


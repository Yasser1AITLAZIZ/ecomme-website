# Troubleshooting: "Failed to fetch" Error

## Problem Summary

When trying to register or login, the frontend shows a "Failed to fetch" error. This indicates the frontend cannot communicate with the backend API.

## Root Causes Identified

### 1. Frontend Missing Environment Configuration
- **Issue**: The `frontend/.env.local` file is missing
- **Impact**: The frontend may not know the correct API URL
- **Default**: The code defaults to `http://localhost:8000/api/v1` which should work, but explicit configuration is better

### 2. Backend Server Status
- **Status**: ✅ Backend IS running on port 8000
- **Verification**: 
  - `http://localhost:8000/` returns: `{"message":"Welcome to PrimoStore API","version":"v1","docs":"/docs"}`
  - `http://localhost:8000/api/health` returns: `{"status":"healthy","service":"PrimoStore","version":"v1"}`

### 3. CORS Configuration
- **Status**: ✅ CORS is configured to allow `http://localhost:3000`
- **Configuration**: Found in `backend/app/config.py` line 27: `ALLOWED_ORIGINS: str = "http://localhost:3000"`

### 4. Authentication Flow
The authentication flow works as follows:
1. Frontend calls Supabase directly for signup/login (this works)
2. Frontend gets Supabase JWT token
3. Frontend calls backend `/api/v1/auth/me` with the token to get user profile
4. **Issue occurs here**: The backend call fails with "Failed to fetch"

## Solutions

### Solution 1: Create Frontend Environment File

Create `frontend/.env.local` with the following content:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Note**: Replace `your-supabase-url` and `your-supabase-anon-key` with your actual Supabase credentials.

### Solution 2: Verify Backend Environment Variables

Ensure `backend/.env` has all required variables:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET` (This is critical for token validation!)
- `SECRET_KEY`

### Solution 3: Check Browser Console

Open browser DevTools (F12) and check:
1. **Console tab**: Look for detailed error messages
2. **Network tab**: 
   - Check if requests to `http://localhost:8000/api/v1/auth/me` are being made
   - Check the request status (should show if it's a CORS error, 401, 500, etc.)
   - Check if the request is being blocked

### Solution 4: Verify Backend is Accessible

Test the backend directly:
```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Test root endpoint
curl http://localhost:8000/
```

### Solution 5: Check CORS Preflight

The "Failed to fetch" error often occurs when:
- CORS preflight (OPTIONS request) fails
- The backend doesn't handle OPTIONS requests properly
- Network connectivity issues

**To debug**:
1. Open browser DevTools → Network tab
2. Try to register/login
3. Look for OPTIONS requests to `http://localhost:8000/api/v1/auth/me`
4. Check if they return 200 OK or fail

### Solution 6: Restart Both Servers

Sometimes a restart helps:
```bash
# Stop backend (Ctrl+C)
# Restart backend
cd backend
uvicorn app.main:app --reload

# Stop frontend (Ctrl+C)  
# Restart frontend
cd frontend
npm run dev
```

## Most Likely Issue

Based on the investigation, the most likely issue is:

1. **Missing Supabase JWT Secret**: The backend needs `SUPABASE_JWT_SECRET` in `.env` to validate tokens. Without it, token validation will fail.

2. **Network/CORS Issue**: The browser might be blocking the request due to CORS or network policies.

## Quick Fix Steps

1. **Create `frontend/.env.local`**:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

2. **Verify `backend/.env` has `SUPABASE_JWT_SECRET`**:
   ```env
   SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase
   ```

3. **Restart both servers**

4. **Check browser console** for detailed errors

5. **Test in browser DevTools Network tab** to see the actual request/response

## Additional Debugging

To get more information, you can:

1. Check backend logs for incoming requests
2. Add console.log in frontend `auth.ts` to see what's happening
3. Use browser DevTools to inspect the actual network requests
4. Check if there are any firewall/antivirus blocking localhost connections


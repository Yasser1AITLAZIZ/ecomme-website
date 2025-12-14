"""Script to synchronize users from auth.users to user_profiles.

This script finds users in auth.users that don't have corresponding
entries in user_profiles and creates the missing profile records.
"""
import sys
import asyncio
from pathlib import Path
import httpx
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import settings
from app.database import get_supabase_client


async def get_auth_users():
    """Get all users from auth.users using Admin API."""
    admin_api_url = f"{settings.SUPABASE_URL}/auth/v1/admin/users"
    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(admin_api_url, headers=headers, timeout=30.0)
        
        if response.status_code != 200:
            raise Exception(f"Failed to fetch auth users: HTTP {response.status_code} - {response.text}")
        
        return response.json().get("users", [])


def get_existing_profiles(db):
    """Get all existing user profiles."""
    response = db.table("user_profiles").select("id").execute()
    return {profile["id"] for profile in response.data}


def create_missing_profiles(db, auth_users, existing_profile_ids):
    """Create user_profiles for users that don't have profiles."""
    missing_users = []
    created_count = 0
    error_count = 0
    
    for user in auth_users:
        user_id = user.get("id")
        if not user_id:
            continue
            
        # Skip if profile already exists
        if user_id in existing_profile_ids:
            continue
        
        # Extract user metadata
        user_metadata = user.get("user_metadata", {}) or {}
        email = user.get("email", "")
        
        # Prepare profile data
        profile_data = {
            "id": user_id,
            "name": user_metadata.get("name") or email.split("@")[0] if email else "User",
            "phone": user_metadata.get("phone"),
            "role": "customer",  # Default role
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        try:
            # Insert profile
            result = db.table("user_profiles").insert(profile_data).execute()
            
            if result.data:
                created_count += 1
                missing_users.append({
                    "id": user_id,
                    "email": email,
                    "name": profile_data["name"],
                    "status": "created"
                })
                print(f"✅ Created profile for user: {email} ({user_id})")
            else:
                error_count += 1
                print(f"⚠️  Failed to create profile for user: {email} ({user_id}) - No data returned")
                
        except Exception as e:
            error_count += 1
            error_msg = str(e)
            # Check if it's a duplicate key error (race condition)
            if "duplicate key" in error_msg.lower() or "already exists" in error_msg.lower():
                print(f"ℹ️  Profile already exists for user: {email} ({user_id})")
            else:
                print(f"❌ Error creating profile for user: {email} ({user_id}): {error_msg}")
                missing_users.append({
                    "id": user_id,
                    "email": email,
                    "name": profile_data["name"],
                    "status": "error",
                    "error": error_msg
                })
    
    return missing_users, created_count, error_count


async def main():
    """Main synchronization function."""
    print("=" * 70)
    print("User Synchronization: auth.users → user_profiles")
    print("=" * 70)
    print()
    
    try:
        # Get all users from auth.users
        print("📥 Fetching users from auth.users...")
        auth_users = await get_auth_users()
        print(f"   Found {len(auth_users)} users in auth.users")
        print()
        
        # Get existing profiles
        print("📥 Fetching existing user profiles...")
        db = get_supabase_client()
        existing_profile_ids = get_existing_profiles(db)
        print(f"   Found {len(existing_profile_ids)} existing profiles")
        print()
        
        # Find and create missing profiles
        print("🔄 Creating missing user profiles...")
        missing_users, created_count, error_count = create_missing_profiles(
            db, auth_users, existing_profile_ids
        )
        print()
        
        # Summary
        print("=" * 70)
        print("Synchronization Summary")
        print("=" * 70)
        print(f"Total users in auth.users: {len(auth_users)}")
        print(f"Existing profiles: {len(existing_profile_ids)}")
        print(f"Missing profiles found: {len(missing_users)}")
        print(f"✅ Successfully created: {created_count}")
        if error_count > 0:
            print(f"❌ Errors: {error_count}")
        print()
        
        if missing_users:
            print("Created/Updated Users:")
            for user in missing_users:
                if user.get("status") == "created":
                    print(f"  - {user.get('email', 'N/A')} ({user.get('name', 'N/A')})")
        
        print()
        print("✅ Synchronization complete!")
        
    except Exception as e:
        print(f"❌ Error during synchronization: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())

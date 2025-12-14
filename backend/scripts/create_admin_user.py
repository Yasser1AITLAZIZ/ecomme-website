"""Script to create admin user for admin dashboard access."""
import os
import sys
import requests
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import settings


def create_admin_user():
    """Create admin user in Supabase Auth."""
    admin_email = "admin@primo-store.com"
    admin_password = "Admin@123"  # Strong password - change this in production!
    admin_name = "Admin User"
    
    # Supabase Admin API endpoint for creating users
    admin_api_url = f"{settings.SUPABASE_URL}/auth/v1/admin/users"
    
    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    
    # Check if user already exists
    check_url = f"{settings.SUPABASE_URL}/auth/v1/admin/users"
    check_params = {"email": admin_email}
    
    try:
        # Check existing users
        response = requests.get(
            check_url,
            headers=headers,
            params=check_params
        )
        
        user_id = None
        
        if response.status_code == 200:
            users = response.json().get("users", [])
            existing_user = next((u for u in users if u.get("email") == admin_email), None)
            
            if existing_user:
                user_id = existing_user.get("id")
                print(f"✅ Admin user already exists: {admin_email}")
                print(f"   User ID: {user_id}")
            else:
                # Create new user
                user_data = {
                    "email": admin_email,
                    "password": admin_password,
                    "email_confirm": True,  # Auto-confirm email for admin user
                    "user_metadata": {
                        "name": admin_name
                    }
                }
                
                print(f"Creating admin user: {admin_email}...")
                response = requests.post(
                    admin_api_url,
                    headers=headers,
                    json=user_data
                )
                
                if response.status_code in [200, 201]:
                    user = response.json()
                    user_id = user.get("id")
                    print(f"✅ Admin user created successfully!")
                else:
                    error_msg = response.json().get("msg", response.text)
                    print(f"❌ Failed to create admin user: {error_msg}")
                    print(f"   Status code: {response.status_code}")
                    return False
        
        if user_id:
            # Create or update user profile with admin role
            from app.database import get_supabase_client
            db = get_supabase_client()
            
            try:
                # Check if profile exists
                profile_check = db.table("user_profiles").select("*").eq("id", user_id).execute()
                
                if profile_check.data:
                    # Update existing profile to admin
                    db.table("user_profiles").update({
                        "name": admin_name,
                        "role": "admin"
                    }).eq("id", user_id).execute()
                    print(f"✅ User profile updated to admin role!")
                else:
                    # Create new profile with admin role
                    profile_data = {
                        "id": user_id,
                        "name": admin_name,
                        "role": "admin"
                    }
                    db.table("user_profiles").insert(profile_data).execute()
                    print(f"✅ User profile created with admin role!")
                
                print()
                print("=" * 60)
                print("✅ ADMIN CREDENTIALS CREATED SUCCESSFULLY!")
                print("=" * 60)
                print()
                print("You can now log in to the admin dashboard with:")
                print(f"   📧 Email:    {admin_email}")
                print(f"   🔑 Password: {admin_password}")
                print()
                print("⚠️  IMPORTANT: Change this password after first login!")
                print()
                print("Admin Dashboard URL: http://localhost:3000/admin/dashboard")
                print("=" * 60)
                
                return True
            except Exception as e:
                print(f"⚠️  User profile creation/update failed: {e}")
                print(f"   You may need to manually update the role in the database:")
                print(f"   UPDATE user_profiles SET role = 'admin' WHERE id = '{user_id}';")
                return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error connecting to Supabase: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("Admin User Creation Script")
    print("=" * 60)
    print()
    
    success = create_admin_user()
    
    print()
    if not success:
        print("❌ Script failed. Please check the error messages above.")
        print()
        print("Note: Make sure your .env file has correct Supabase credentials:")
        print("   - SUPABASE_URL")
        print("   - SUPABASE_SERVICE_ROLE_KEY")
    
    sys.exit(0 if success else 1)

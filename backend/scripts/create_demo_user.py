"""Script to create demo user for testing."""
import os
import sys
import requests
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import settings


def create_demo_user():
    """Create demo user in Supabase Auth."""
    demo_email = "demo@example.com"
    demo_password = "demo123"
    demo_name = "Demo User"
    
    # Supabase Admin API endpoint for creating users
    # Note: This requires the service role key
    admin_api_url = f"{settings.SUPABASE_URL}/auth/v1/admin/users"
    
    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    
    # Check if user already exists
    check_url = f"{settings.SUPABASE_URL}/auth/v1/admin/users"
    check_params = {"email": demo_email}
    
    try:
        # Check existing users
        response = requests.get(
            check_url,
            headers=headers,
            params=check_params
        )
        
        if response.status_code == 200:
            users = response.json().get("users", [])
            existing_user = next((u for u in users if u.get("email") == demo_email), None)
            
            if existing_user:
                print(f"✅ Demo user already exists: {demo_email}")
                print(f"   User ID: {existing_user.get('id')}")
                return True
        
        # Create new user
        user_data = {
            "email": demo_email,
            "password": demo_password,
            "email_confirm": True,  # Auto-confirm email for demo user
            "user_metadata": {
                "name": demo_name
            }
        }
        
        print(f"Creating demo user: {demo_email}...")
        response = requests.post(
            admin_api_url,
            headers=headers,
            json=user_data
        )
        
        if response.status_code in [200, 201]:
            user = response.json()
            user_id = user.get("id")
            print(f"✅ Demo user created successfully!")
            print(f"   Email: {demo_email}")
            print(f"   Password: {demo_password}")
            print(f"   User ID: {user_id}")
            
            # Create user profile
            from app.database import get_supabase_client
            db = get_supabase_client()
            
            try:
                profile_data = {
                    "id": user_id,
                    "name": demo_name,
                    "role": "customer"
                }
                db.table("user_profiles").insert(profile_data).execute()
                print(f"✅ User profile created successfully!")
            except Exception as e:
                print(f"⚠️  User profile creation failed (may already exist): {e}")
            
            return True
        else:
            error_msg = response.json().get("msg", response.text)
            print(f"❌ Failed to create demo user: {error_msg}")
            print(f"   Status code: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error connecting to Supabase: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


if __name__ == "__main__":
    print("=" * 50)
    print("Demo User Creation Script")
    print("=" * 50)
    print()
    
    success = create_demo_user()
    
    print()
    if success:
        print("✅ Script completed successfully!")
        print()
        print("You can now log in with:")
        print(f"   Email: demo@example.com")
        print(f"   Password: demo123")
    else:
        print("❌ Script failed. Please check the error messages above.")
        print()
        print("Note: Make sure your .env file has correct Supabase credentials:")
        print("   - SUPABASE_URL")
        print("   - SUPABASE_SERVICE_ROLE_KEY")
    
    sys.exit(0 if success else 1)


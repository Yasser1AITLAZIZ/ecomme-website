"""Script to reset demo user password."""
import os
import sys
import requests
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import settings


def reset_demo_password():
    """Reset demo user password in Supabase Auth."""
    demo_email = "demo@example.com"
    demo_password = "demo123"
    
    # Supabase Admin API endpoint for updating users
    admin_api_url = f"{settings.SUPABASE_URL}/auth/v1/admin/users"
    
    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        # First, get the user by email
        print(f"Looking for user: {demo_email}...")
        response = requests.get(
            admin_api_url,
            headers=headers,
            params={"email": demo_email}
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to get user: {response.text}")
            return False
        
        users = response.json().get("users", [])
        user = next((u for u in users if u.get("email") == demo_email), None)
        
        if not user:
            print(f"❌ User not found: {demo_email}")
            print("   Run create_demo_user.py first to create the user.")
            return False
        
        user_id = user.get("id")
        print(f"✅ Found user: {demo_email}")
        print(f"   User ID: {user_id}")
        
        # Update user password using Admin API
        update_url = f"{admin_api_url}/{user_id}"
        update_data = {
            "password": demo_password
        }
        
        print(f"Resetting password to: {demo_password}...")
        update_response = requests.put(
            update_url,
            headers=headers,
            json=update_data
        )
        
        if update_response.status_code in [200, 201]:
            print(f"✅ Password reset successfully!")
            print(f"   Email: {demo_email}")
            print(f"   Password: {demo_password}")
            return True
        else:
            error_msg = update_response.json().get("msg", update_response.text)
            print(f"❌ Failed to reset password: {error_msg}")
            print(f"   Status code: {update_response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error connecting to Supabase: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


if __name__ == "__main__":
    print("=" * 50)
    print("Demo User Password Reset Script")
    print("=" * 50)
    print()
    
    success = reset_demo_password()
    
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


"""Script to apply delivery_type migration to Supabase database."""
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import settings


def check_column_exists_via_supabase():
    """Check if delivery_type column exists by trying to query it."""
    try:
        from app.database import get_supabase_client
        db = get_supabase_client()
        
        # Try to select delivery_type from orders (will fail if column doesn't exist)
        try:
            result = db.table("orders").select("delivery_type").limit(1).execute()
            return True
        except Exception as e:
            if "delivery_type" in str(e) or "PGRST204" in str(e):
                return False
            raise
    except Exception as e:
        print(f"Error checking column: {e}")
        return None


def apply_migration():
    """Apply delivery_type migration if column doesn't exist."""
    print("=" * 70)
    print("Delivery Type Migration Checker")
    print("=" * 70)
    print()
    
    # Check if column exists
    print("Checking if 'delivery_type' column exists in 'orders' table...")
    column_exists = check_column_exists_via_supabase()
    
    if column_exists is True:
        print("✅ Column 'delivery_type' already exists in 'orders' table")
        print("   Migration already applied!")
        return True
    elif column_exists is False:
        print("❌ Column 'delivery_type' does NOT exist in 'orders' table")
        print()
        print("Please apply the migration manually:")
        print()
        print("1. Go to your Supabase Dashboard")
        print("2. Navigate to SQL Editor")
        print("3. Run the following SQL:")
        print()
        print("-" * 70)
        
        # Read and display the migration file
        migration_file = Path(__file__).parent.parent / "supabase" / "migrations" / "006_add_delivery_type.sql"
        if migration_file.exists():
            with open(migration_file, "r", encoding="utf-8") as f:
                print(f.read())
        else:
            print("-- Migration file not found!")
        
        print("-" * 70)
        print()
        print("After running the migration, restart your backend server")
        print("to refresh PostgREST schema cache.")
        return False
    else:
        print("⚠️  Could not determine column status")
        print("   Please check manually and apply migration if needed")
        return False


if __name__ == "__main__":
    apply_migration()


"""Script to apply guest cart migration to Supabase database."""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import settings
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT


def check_column_exists(conn, table_name: str, column_name: str) -> bool:
    """Check if a column exists in a table."""
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = %s AND column_name = %s
        """, (table_name, column_name))
        return cursor.fetchone() is not None
    finally:
        cursor.close()


def apply_migration():
    """Apply guest cart migration if column doesn't exist."""
    # Extract database connection info from Supabase URL
    # Supabase connection string format: postgresql://postgres:[password]@[host]:[port]/postgres
    # We need to construct this from settings
    
    print("=" * 70)
    print("Guest Cart Migration Checker")
    print("=" * 70)
    print()
    
    # Check if we have database connection info
    # Note: Supabase doesn't expose direct PostgreSQL connection in Python client
    # We'll need the database password from environment or user input
    
    print("⚠️  This script requires direct PostgreSQL access.")
    print("   Supabase Python client doesn't support raw SQL execution.")
    print()
    print("Please apply the migration manually:")
    print()
    print("1. Go to your Supabase Dashboard")
    print("2. Navigate to SQL Editor")
    print("3. Run the following SQL:")
    print()
    print("-" * 70)
    
    # Read and display the migration file
    migration_file = Path(__file__).parent.parent / "supabase" / "migrations" / "006_add_guest_cart_support.sql"
    if migration_file.exists():
        with open(migration_file, "r") as f:
            print(f.read())
    else:
        print("-- Migration file not found!")
    
    print("-" * 70)
    print()
    print("Alternatively, if you have PostgreSQL connection details:")
    print("   Set these environment variables:")
    print("   - DB_HOST (your Supabase database host)")
    print("   - DB_PORT (usually 5432)")
    print("   - DB_NAME (usually 'postgres')")
    print("   - DB_USER (usually 'postgres')")
    print("   - DB_PASSWORD (your database password)")
    print()
    
    # Try to apply migration if we have connection details
    import os
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT", "5432")
    db_name = os.getenv("DB_NAME", "postgres")
    db_user = os.getenv("DB_USER", "postgres")
    db_password = os.getenv("DB_PASSWORD")
    
    if db_host and db_password:
        try:
            print(f"Attempting to connect to database at {db_host}...")
            conn = psycopg2.connect(
                host=db_host,
                port=db_port,
                database=db_name,
                user=db_user,
                password=db_password
            )
            conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            
            # Check if column exists
            if check_column_exists(conn, "cart_items", "guest_session_id"):
                print("✅ Column 'guest_session_id' already exists in 'cart_items' table")
                conn.close()
                return True
            
            print("❌ Column 'guest_session_id' does NOT exist")
            print("Applying migration...")
            
            # Read migration file
            with open(migration_file, "r") as f:
                migration_sql = f.read()
            
            # Execute migration
            cursor = conn.cursor()
            cursor.execute(migration_sql)
            cursor.close()
            
            # Verify
            if check_column_exists(conn, "cart_items", "guest_session_id"):
                print("✅ Migration applied successfully!")
                conn.close()
                return True
            else:
                print("❌ Migration failed - column still doesn't exist")
                conn.close()
                return False
                
        except ImportError:
            print("⚠️  psycopg2 not installed. Install it with: pip install psycopg2-binary")
            print("   Or apply the migration manually using the SQL above.")
            return False
        except Exception as e:
            print(f"❌ Error applying migration: {e}")
            print("   Please apply the migration manually using the SQL above.")
            return False
    else:
        print("ℹ️  No database connection details provided.")
        print("   Please apply the migration manually using the SQL above.")
        return False


if __name__ == "__main__":
    success = apply_migration()
    sys.exit(0 if success else 1)


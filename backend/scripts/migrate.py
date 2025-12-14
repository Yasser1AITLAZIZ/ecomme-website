"""Migration runner script."""
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import get_supabase_client
from app.config import settings


def run_migrations():
    """Run all migration files in order."""
    db = get_supabase_client()
    
    migrations_dir = Path(__file__).parent.parent / "supabase" / "migrations"
    migration_files = sorted(migrations_dir.glob("*.sql"))
    
    print(f"Found {len(migration_files)} migration files")
    
    for migration_file in migration_files:
        print(f"Running {migration_file.name}...")
        
        with open(migration_file, "r") as f:
            sql = f.read()
        
        try:
            # Execute SQL (Supabase client doesn't have direct SQL execution)
            # This would need to be run in Supabase SQL Editor or via psql
            print(f"  ⚠️  Please run {migration_file.name} manually in Supabase SQL Editor")
            print(f"  SQL file: {migration_file}")
        except Exception as e:
            print(f"  ❌ Error: {e}")
            return False
    
    print("\n✅ Migration instructions printed")
    print("Please run the SQL files in Supabase SQL Editor in order:")
    for migration_file in migration_files:
        print(f"  - {migration_file.name}")
    
    return True


if __name__ == "__main__":
    run_migrations()


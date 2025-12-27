-- Migration to add city-based shipping fees configuration
-- This allows setting specific shipping fees for different cities
-- Example: Casablanca = free (0), other cities = 150 MAD default
--
-- Security considerations:
-- 1. This migration runs with service_role privileges (bypasses RLS automatically)
-- 2. The system_settings table has RLS enabled with admin-only policies (see 002_rls_policies.sql)
-- 3. This migration uses INSERT ... ON CONFLICT to be idempotent (safe to run multiple times)
-- 4. JSONB is validated by PostgreSQL schema constraints and explicit validation below
-- 5. The migration does not modify RLS policies, only inserts/updates data

-- Validate JSON structure before insertion to prevent invalid data
DO $$
DECLARE
    config_json JSONB := '{
        "casablanca": 0.0,
        "default": 150.0
    }'::jsonb;
    rec RECORD;
    city_key TEXT;
    city_value JSONB;
BEGIN
    -- Validate JSON structure
    IF jsonb_typeof(config_json) != 'object' THEN
        RAISE EXCEPTION 'Invalid JSON: must be an object';
    END IF;
    
    -- Validate that "default" key exists and is a number
    IF NOT (config_json ? 'default') THEN
        RAISE EXCEPTION 'Invalid JSON: missing required "default" key';
    END IF;
    
    IF jsonb_typeof(config_json->'default') != 'number' THEN
        RAISE EXCEPTION 'Invalid JSON: "default" must be a number';
    END IF;
    
    -- Validate that default is non-negative
    IF (config_json->>'default')::numeric < 0 THEN
        RAISE EXCEPTION 'Invalid JSON: "default" must be non-negative';
    END IF;
    
    -- Validate city fees are numbers and non-negative
    FOR rec IN SELECT key, value FROM jsonb_each(config_json) LOOP
        city_key := rec.key;
        city_value := rec.value;
        
        IF city_key != 'default' AND jsonb_typeof(city_value) != 'number' THEN
            RAISE EXCEPTION 'Invalid JSON: city fee for "%" must be a number', city_key;
        END IF;
        IF city_key != 'default' AND (city_value::text)::numeric < 0 THEN
            RAISE EXCEPTION 'Invalid JSON: city fee for "%" must be non-negative', city_key;
        END IF;
    END LOOP;
END $$;

-- Insert or update city_shipping_fees configuration in system_settings
-- Using ON CONFLICT makes this migration idempotent (safe to run multiple times)
-- Note: Migrations run with service_role which bypasses RLS, so this is safe
INSERT INTO public.system_settings (key, value, description, updated_by, updated_at)
VALUES (
  'city_shipping_fees',
  '{
    "casablanca": 0.0,
    "default": 150.0
  }'::jsonb,
  'City-based shipping fees configuration. Keys are city names in lowercase. "default" is used for cities not listed.',
  NULL, -- NULL for system/migration-created settings (not created by a user)
  NOW()
)
ON CONFLICT (key) 
DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_by = NULL, -- Reset to NULL for migration updates (preserves audit trail)
  updated_at = NOW();

-- Note: The structure allows easy addition of more cities:
-- {
--   "casablanca": 0.0,
--   "rabat": 20.0,
--   "marrakech": 30.0,
--   "default": 150.0
-- }
--
-- Security notes:
-- 1. RLS policies on system_settings ensure only admins can modify via API
-- 2. This migration bypasses RLS (runs with service_role) which is standard for migrations
-- 3. The JSONB value is validated by PostgreSQL's type system
-- 4. City names are normalized to lowercase in the application layer (DeliveryFeeService)


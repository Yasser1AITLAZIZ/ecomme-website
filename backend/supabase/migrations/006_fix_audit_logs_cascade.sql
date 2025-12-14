-- Fix foreign key constraints for audit_logs and security_logs
-- to allow user deletion by setting user_id to NULL when user is deleted
-- This preserves audit trail while allowing user deletion

-- Drop existing foreign key constraints
ALTER TABLE IF EXISTS audit_logs 
DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

ALTER TABLE IF EXISTS security_logs 
DROP CONSTRAINT IF EXISTS security_logs_user_id_fkey;

-- Recreate with ON DELETE SET NULL to preserve audit trail
ALTER TABLE audit_logs
ADD CONSTRAINT audit_logs_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

ALTER TABLE security_logs
ADD CONSTRAINT security_logs_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

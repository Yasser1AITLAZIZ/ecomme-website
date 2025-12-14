-- Function to reset email_confirmed_at when email is changed
-- This allows the backend to reset email confirmation status via RPC

CREATE OR REPLACE FUNCTION reset_user_email_confirmation(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE auth.users 
  SET email_confirmed_at = NULL 
  WHERE id = user_id;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION reset_user_email_confirmation(UUID) TO service_role;


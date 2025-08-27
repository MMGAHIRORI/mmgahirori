-- Migration: Add temporary user functionality to user_profiles table
-- Run this script in your Supabase SQL editor or via command line

-- Add new columns for temporary user functionality
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS admin_created BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for efficient querying of expired temporary users
CREATE INDEX IF NOT EXISTS idx_user_profiles_temp_expired 
ON user_profiles (role, expires_at, is_disabled) 
WHERE role = 'temp_admin_creator';

-- Create index for efficient querying of temporary users who haven't created admin yet
CREATE INDEX IF NOT EXISTS idx_user_profiles_temp_admin_created 
ON user_profiles (role, admin_created) 
WHERE role = 'temp_admin_creator';

-- Add a function to automatically disable expired temporary users
CREATE OR REPLACE FUNCTION disable_expired_temp_users()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE user_profiles 
    SET is_disabled = true,
        updated_at = NOW()
    WHERE role = 'temp_admin_creator'
      AND expires_at < NOW()
      AND is_disabled = false;
END;
$$;

-- Create a scheduled job to run the cleanup function every hour
-- Note: This requires the pg_cron extension to be enabled in your Supabase project
-- You can enable it in Database > Extensions in the Supabase dashboard
-- 
-- SELECT cron.schedule(
--     'disable-expired-temp-users',
--     '0 * * * *', -- Every hour
--     'SELECT disable_expired_temp_users();'
-- );

-- Add RLS (Row Level Security) policies for temporary users
-- This ensures temporary users can only see and modify their own data

-- Policy for temp users to read their own profile
CREATE POLICY IF NOT EXISTS "temp_users_can_read_own_profile" 
ON user_profiles 
FOR SELECT 
TO authenticated
USING (
    auth.uid() = user_id::uuid 
    AND role = 'temp_admin_creator'
);

-- Policy for temp users to update their own profile (limited fields)
CREATE POLICY IF NOT EXISTS "temp_users_can_update_own_profile" 
ON user_profiles 
FOR UPDATE 
TO authenticated
USING (
    auth.uid() = user_id::uuid 
    AND role = 'temp_admin_creator'
);

-- Add constraint to ensure expires_at is set for temporary users
ALTER TABLE user_profiles 
ADD CONSTRAINT temp_user_expires_at_required 
CHECK (
    (role != 'temp_admin_creator') OR 
    (role = 'temp_admin_creator' AND expires_at IS NOT NULL)
);

-- Add constraint to ensure admin_created is not null for temporary users
ALTER TABLE user_profiles 
ADD CONSTRAINT temp_user_admin_created_not_null 
CHECK (
    (role != 'temp_admin_creator') OR 
    (role = 'temp_admin_creator' AND admin_created IS NOT NULL)
);

-- Update existing role enum or add validation
-- Note: If you have role as an enum, you might need to add the new role
-- ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'temp_admin_creator';

-- Add comment to document the new functionality
COMMENT ON COLUMN user_profiles.admin_created IS 'For temporary users: tracks if they have created their allowed admin user';
COMMENT ON COLUMN user_profiles.expires_at IS 'For temporary users: timestamp when the account expires and should be disabled';

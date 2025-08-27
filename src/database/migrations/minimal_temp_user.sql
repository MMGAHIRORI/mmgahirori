-- Minimal migration: Add temporary user functionality without complex policies
-- Run this in your Supabase SQL editor

-- Add new columns for temporary user functionality
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS admin_created BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Set default values for existing records
UPDATE user_profiles 
SET admin_created = FALSE 
WHERE admin_created IS NULL;

UPDATE user_profiles 
SET expires_at = NULL 
WHERE role != 'temp_admin_creator';

-- Add comment to document the new functionality
COMMENT ON COLUMN user_profiles.admin_created IS 'For temporary users: tracks if they have created their allowed admin user';
COMMENT ON COLUMN user_profiles.expires_at IS 'For temporary users: timestamp when the account expires and should be disabled';

-- Verify the migration worked
SELECT 'Minimal migration completed successfully' as status;

-- Check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_profiles';

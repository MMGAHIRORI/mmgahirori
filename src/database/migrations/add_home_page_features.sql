-- Migration: Add home page features
-- This adds the show_on_home_page field to gallery_photos table
-- and enhances user management for operator roles

-- Add show_on_home_page field to gallery_photos table
ALTER TABLE gallery_photos 
ADD COLUMN IF NOT EXISTS show_on_home_page BOOLEAN DEFAULT FALSE;

-- Create index for performance on home page queries
CREATE INDEX IF NOT EXISTS idx_gallery_photos_show_on_home_page 
ON gallery_photos(show_on_home_page) WHERE show_on_home_page = true;

-- Add operator-specific fields to user_profiles if they don't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS can_manage_events BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_manage_gallery BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_manage_livestream BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_edit_profile BOOLEAN DEFAULT TRUE;

-- Update existing admin users to have all permissions
UPDATE user_profiles 
SET can_manage_events = TRUE,
    can_manage_gallery = TRUE,
    can_manage_livestream = TRUE,
    can_edit_profile = TRUE
WHERE role = 'admin';

-- Create operator role permissions
-- Normal users have limited permissions by default
UPDATE user_profiles 
SET can_manage_events = FALSE,
    can_manage_gallery = FALSE,
    can_manage_livestream = FALSE,
    can_edit_profile = FALSE
WHERE role = 'user';

-- Add RLS policies for the new fields
-- First drop existing policies if they exist
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can read own permissions" ON user_profiles;
    DROP POLICY IF EXISTS "Admins can update permissions" ON user_profiles;
    DROP POLICY IF EXISTS "Anyone can read home page photos" ON gallery_photos;
EXCEPTION
    WHEN undefined_object THEN
        -- Policies don't exist, continue
        NULL;
END $$;

-- Create new policies
-- Allow users to read their own permissions
CREATE POLICY "Users can read own permissions"
ON user_profiles FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

-- Allow admins to update permissions
CREATE POLICY "Admins can update permissions"
ON user_profiles FOR UPDATE
TO authenticated
USING (
  EXISTS(
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid()::text 
    AND role = 'admin'
  )
);

-- Allow reading photos marked for home page
CREATE POLICY "Anyone can read home page photos"
ON gallery_photos FOR SELECT
TO anon, authenticated
USING (show_on_home_page = true);

-- Comment to track migration
COMMENT ON COLUMN gallery_photos.show_on_home_page IS 'Flag to show photo on home page gallery section';
COMMENT ON COLUMN user_profiles.can_manage_events IS 'Permission to manage events';
COMMENT ON COLUMN user_profiles.can_manage_gallery IS 'Permission to manage gallery';
COMMENT ON COLUMN user_profiles.can_manage_livestream IS 'Permission to manage live streams';
COMMENT ON COLUMN user_profiles.can_edit_profile IS 'Permission to edit own profile';

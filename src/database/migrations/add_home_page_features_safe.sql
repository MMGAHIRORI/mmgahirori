-- Safe Migration: Add home page features
-- Run these commands one by one in your Supabase SQL editor

-- Step 1: Add new columns to gallery_photos
ALTER TABLE gallery_photos 
ADD COLUMN IF NOT EXISTS show_on_home_page BOOLEAN DEFAULT FALSE;

-- Step 2: Create index for performance
CREATE INDEX IF NOT EXISTS idx_gallery_photos_show_on_home_page 
ON gallery_photos(show_on_home_page) WHERE show_on_home_page = true;

-- Step 3: Add operator permission columns to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS can_manage_events BOOLEAN DEFAULT FALSE;

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS can_manage_gallery BOOLEAN DEFAULT FALSE;

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS can_manage_livestream BOOLEAN DEFAULT FALSE;

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS can_edit_profile BOOLEAN DEFAULT TRUE;

-- Step 4: Update existing admin users to have all permissions
UPDATE user_profiles 
SET can_manage_events = TRUE,
    can_manage_gallery = TRUE,
    can_manage_livestream = TRUE,
    can_edit_profile = TRUE
WHERE role = 'admin';

-- Step 5: Set default permissions for regular users
UPDATE user_profiles 
SET can_manage_events = COALESCE(can_manage_events, FALSE),
    can_manage_gallery = COALESCE(can_manage_gallery, FALSE),
    can_manage_livestream = COALESCE(can_manage_livestream, FALSE),
    can_edit_profile = COALESCE(can_edit_profile, TRUE)
WHERE role = 'user';

-- Step 6: Drop existing policies (run these separately if they exist)
-- DROP POLICY IF EXISTS "Users can read own permissions" ON user_profiles;
-- DROP POLICY IF EXISTS "Admins can update permissions" ON user_profiles;
-- DROP POLICY IF EXISTS "Anyone can read home page photos" ON gallery_photos;

-- Step 7: Create RLS policies (run after dropping existing ones)
-- Note: Only run these if the above DROP commands were successful or if policies don't exist

-- Allow users to read their own permissions
-- CREATE POLICY "Users can read own permissions"
-- ON user_profiles FOR SELECT
-- TO authenticated
-- USING (auth.uid()::text = user_id);

-- Allow admins to update permissions
-- CREATE POLICY "Admins can update permissions"
-- ON user_profiles FOR UPDATE
-- TO authenticated
-- USING (
--   EXISTS(
--     SELECT 1 FROM user_profiles 
--     WHERE user_id = auth.uid()::text 
--     AND role = 'admin'
--   )
-- );

-- Allow reading photos marked for home page
-- CREATE POLICY "Anyone can read home page photos"
-- ON gallery_photos FOR SELECT
-- TO anon, authenticated
-- USING (show_on_home_page = true);

-- Step 8: Add column comments for documentation
COMMENT ON COLUMN gallery_photos.show_on_home_page IS 'Flag to show photo on home page gallery section';
COMMENT ON COLUMN user_profiles.can_manage_events IS 'Permission to manage events';
COMMENT ON COLUMN user_profiles.can_manage_gallery IS 'Permission to manage gallery';
COMMENT ON COLUMN user_profiles.can_manage_livestream IS 'Permission to manage live streams';
COMMENT ON COLUMN user_profiles.can_edit_profile IS 'Permission to edit own profile';

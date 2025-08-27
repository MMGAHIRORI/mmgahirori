-- Minimal Migration: Essential table structure changes only
-- This script only adds the required columns without touching RLS policies

-- 1. Add show_on_home_page column to gallery_photos
ALTER TABLE gallery_photos 
ADD COLUMN IF NOT EXISTS show_on_home_page BOOLEAN DEFAULT FALSE;

-- 2. Add operator permission columns to user_profiles  
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS can_manage_events BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_manage_gallery BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_manage_livestream BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_edit_profile BOOLEAN DEFAULT TRUE;

-- 3. Update existing admin users to have full permissions
UPDATE user_profiles 
SET can_manage_events = TRUE,
    can_manage_gallery = TRUE,
    can_manage_livestream = TRUE,
    can_edit_profile = TRUE
WHERE role = 'admin';

-- 4. Create performance index
CREATE INDEX IF NOT EXISTS idx_gallery_photos_home_page 
ON gallery_photos(show_on_home_page) 
WHERE show_on_home_page = true;

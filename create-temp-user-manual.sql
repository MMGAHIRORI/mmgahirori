-- Manual creation of temporary user (run this in Supabase SQL Editor)
-- This bypasses the signup process and creates the user directly

-- Step 1: First create the auth user (you may need to do this through Supabase Dashboard)
-- Go to Authentication > Users > Add user:
-- Email: mmgahirori@gmail.com
-- Password: Admin@123
-- Auto confirm: YES

-- Step 2: After creating auth user, get the user ID and run this:
-- (Replace 'YOUR_USER_ID_HERE' with the actual UUID from step 1)

-- First, disable RLS temporarily
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Check if user profile exists (it should be auto-created by trigger)
SELECT user_id, email, role FROM user_profiles WHERE email = 'mmgahirori@gmail.com';

-- If profile doesn't exist, create it manually:
-- INSERT INTO user_profiles (user_id, name, email, role, can_read, can_write, is_disabled, admin_created, expires_at)
-- VALUES ('YOUR_USER_ID_HERE', 'Sangam', 'mmgahirori@gmail.com', 'temp_admin_creator', false, false, false, false, NOW() + INTERVAL '24 hours');

-- If profile exists, update it for temporary user:
UPDATE user_profiles 
SET 
    name = 'Sangam',
    role = 'temp_admin_creator',
    can_read = false,
    can_write = false,
    is_disabled = false,
    admin_created = false,
    expires_at = NOW() + INTERVAL '24 hours',
    updated_at = NOW()
WHERE email = 'mmgahirori@gmail.com';

-- Verify the user was created/updated correctly
SELECT user_id, name, email, role, admin_created, expires_at, is_disabled
FROM user_profiles 
WHERE email = 'mmgahirori@gmail.com';

-- Check auth user exists
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'mmgahirori@gmail.com';

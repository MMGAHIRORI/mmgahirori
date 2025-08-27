-- Alternative approach: Work with actual table structure
-- Run this step by step in Supabase SQL Editor

-- STEP 1: First check what columns exist in user_profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- STEP 2: Check auth.users for the email
SELECT id, email, email_confirmed_at, created_at
FROM auth.users 
WHERE email = 'mmgahirori@gmail.com';

-- STEP 3: If user exists in auth.users but not in user_profiles, let's check user_profiles structure
SELECT * FROM user_profiles LIMIT 3;

-- STEP 4A: If user_profiles has user_id column, find by user_id from auth.users
-- First get the user_id from auth.users, then use it below:

-- STEP 4B: Create/Update user profile with correct user_id
-- Replace 'YOUR_USER_ID_FROM_AUTH_USERS' with actual UUID from step 2

-- Example (replace the UUID):
-- UPDATE user_profiles 
-- SET 
--     name = 'Sangam',
--     role = 'temp_admin_creator',
--     can_read = false,
--     can_write = false, 
--     is_disabled = false,
--     admin_created = false,
--     expires_at = NOW() + INTERVAL '24 hours'
-- WHERE user_id = 'YOUR_USER_ID_FROM_AUTH_USERS';

-- STEP 5: Alternative - Insert if no profile exists
-- INSERT INTO user_profiles (user_id, name, role, can_read, can_write, is_disabled, admin_created, expires_at)
-- VALUES ('YOUR_USER_ID_FROM_AUTH_USERS', 'Sangam', 'temp_admin_creator', false, false, false, false, NOW() + INTERVAL '24 hours');

-- STEP 6: Verify final result
-- SELECT * FROM user_profiles WHERE user_id = 'YOUR_USER_ID_FROM_AUTH_USERS';

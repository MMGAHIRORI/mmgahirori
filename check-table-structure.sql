-- Check the actual structure of user_profiles table
-- Run this in Supabase SQL Editor to see what columns exist

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Check if table exists at all
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'user_profiles';

-- Show all data in the table (if it exists)
SELECT * FROM user_profiles LIMIT 5;

-- Check auth.users table structure  
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'auth'
ORDER BY ordinal_position;

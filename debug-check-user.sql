-- Debug script: Check if temporary user was created correctly
-- Run this in your Supabase SQL Editor

-- 1. Check if the new columns exist in user_profiles
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND column_name IN ('admin_created', 'expires_at', 'role', 'name', 'email');

-- 2. Check all users in user_profiles table
SELECT user_id, name, email, role, admin_created, expires_at, is_disabled, created_at
FROM user_profiles 
ORDER BY created_at DESC;

-- 3. Check if mmgahirori@gmail.com user exists
SELECT user_id, name, email, role, admin_created, expires_at, is_disabled
FROM user_profiles 
WHERE email = 'mmgahirori@gmail.com';

-- 4. Check authentication table to see if user was created
SELECT id, email, email_confirmed_at, created_at
FROM auth.users 
WHERE email = 'mmgahirori@gmail.com';

-- 5. Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 6. Check existing policies
SELECT policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Quick fix for RLS issues with temporary users
-- Run this in your Supabase SQL editor

-- First, check what RLS policies exist
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Temporarily disable RLS on user_profiles to test (ONLY FOR DEVELOPMENT)
-- WARNING: This removes security - only use for testing the temp user flow
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Alternative: Add a more permissive policy for authenticated users
-- (Uncomment the lines below if you prefer to keep RLS enabled)

-- DROP POLICY IF EXISTS "authenticated_users_can_read_profiles" ON user_profiles;
-- CREATE POLICY "authenticated_users_can_read_profiles" 
-- ON user_profiles 
-- FOR SELECT 
-- TO authenticated
-- USING (true); -- Allow all authenticated users to read profiles

-- DROP POLICY IF EXISTS "users_can_update_own_profile" ON user_profiles;  
-- CREATE POLICY "users_can_update_own_profile" 
-- ON user_profiles 
-- FOR UPDATE 
-- TO authenticated
-- USING (auth.uid() = user_id::uuid);

-- Verify changes
SELECT 'RLS fix applied' as status;

-- Check the user_profiles table structure
\d user_profiles;

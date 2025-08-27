-- Fix infinite recursion in admin_users policies
-- Drop the problematic policy
DROP POLICY IF EXISTS "Admin users can view admin list" ON admin_users;

-- Create a simpler policy that doesn't cause recursion
-- Allow authenticated users to read admin_users if they are an admin
CREATE POLICY "Allow admin access" ON admin_users
FOR ALL
USING (auth.uid() = user_id);
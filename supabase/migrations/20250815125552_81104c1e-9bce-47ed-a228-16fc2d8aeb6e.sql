-- Fix admin_users RLS policies to allow proper admin creation

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow admin access" ON public.admin_users;

-- Create new policies that allow admin signup and proper access
CREATE POLICY "Users can insert their own admin record" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin users can view admin records" 
ON public.admin_users 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admin users can update their own record" 
ON public.admin_users 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admin users can delete their own record" 
ON public.admin_users 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create a demo admin user with a specific email for initial setup
-- This will be overwritten when the first real admin signs up
INSERT INTO public.admin_users (user_id, email, role)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'demo@maharshi.com',
  'admin'
) ON CONFLICT (user_id) DO NOTHING;
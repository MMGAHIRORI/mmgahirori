-- First, let's create a proper admin user in the system
-- We'll insert a demo admin user that can be used for testing
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin@maharshi.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Now add this user to the admin_users table
INSERT INTO public.admin_users (
  user_id,
  email,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin@maharshi.com',
  'admin'
) ON CONFLICT (user_id) DO NOTHING;
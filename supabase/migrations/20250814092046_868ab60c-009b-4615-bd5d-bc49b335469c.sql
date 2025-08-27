-- Add a demo admin user to admin_users table
-- Using a fixed UUID for the admin user
INSERT INTO public.admin_users (
  user_id,
  email,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin@maharshi.com',
  'admin'
);
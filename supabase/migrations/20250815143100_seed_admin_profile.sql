-- Seed an admin profile if the demo admin exists
insert into public.user_profiles (user_id, email, name, role, can_read, can_write, is_disabled)
select au.user_id, au.email, 'Administrator', 'admin', true, true, false
from public.admin_users au
where au.email = 'admin@maharshi.com'
on conflict (user_id) do nothing;



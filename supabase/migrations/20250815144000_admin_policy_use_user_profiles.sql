-- Recreate admin policy for user_profiles to use user_profiles.role instead of admin_users
drop policy if exists "Admins can manage profiles" on public.user_profiles;
create policy "Admins can manage profiles" on public.user_profiles
for all using (
  exists (
    select 1 from public.user_profiles up
    where up.user_id = auth.uid() and up.role = 'admin'
  )
) with check (
  exists (
    select 1 from public.user_profiles up
    where up.user_id = auth.uid() and up.role = 'admin'
  )
);



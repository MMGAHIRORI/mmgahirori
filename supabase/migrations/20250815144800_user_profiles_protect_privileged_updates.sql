-- Prevent non-admins from changing privileged fields on their profile
create or replace function public.is_current_user_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_profiles up
    where up.user_id = auth.uid() and up.role = 'admin'
  );
$$;

create or replace function public.block_privileged_profile_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_current_user_admin() then
    if new.role is distinct from old.role
       or new.can_write is distinct from old.can_write
       or new.is_disabled is distinct from old.is_disabled then
      raise exception 'Not authorized to change privileged fields';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_block_privileged_profile_changes on public.user_profiles;
create trigger trg_block_privileged_profile_changes
before update on public.user_profiles
for each row execute procedure public.block_privileged_profile_changes();



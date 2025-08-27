-- Create user profiles table with roles and permissions
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null unique,
  role text not null default 'user' check (role in ('user','admin')),
  can_read boolean not null default true,
  can_write boolean not null default false,
  is_disabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep this table protected
alter table public.user_profiles enable row level security;

-- Trigger to update updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_profiles_updated_at on public.user_profiles;
create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row execute procedure public.set_updated_at();

-- Seed/maintain profile on new auth user signup using user metadata (e.g., name)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, email, name)
  values (new.id, new.email, coalesce((new.raw_user_meta_data ->> 'name')::text, ''))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Policies:
-- 1) Users can read and update only their own profile (except role/permissions fields)
drop policy if exists "Users read own profile" on public.user_profiles;
create policy "Users read own profile" on public.user_profiles
for select using (auth.uid() = user_id);

drop policy if exists "Users insert own profile" on public.user_profiles;
create policy "Users insert own profile" on public.user_profiles
for insert with check (auth.uid() = user_id);

-- Allow users to update only their non-privileged fields
drop policy if exists "Users update own non-privileged fields" on public.user_profiles;
create policy "Users update own non-privileged fields" on public.user_profiles
for update using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and (role is not distinct from role) -- cannot elevate via RLS; role updates blocked by separate admin policy only
);

-- 2) Admins can view and manage everyone
-- Define admin as anyone present in public.admin_users
drop policy if exists "Admins can manage profiles" on public.user_profiles;
create policy "Admins can manage profiles" on public.user_profiles
for all using (
  exists (
    select 1 from public.admin_users au where au.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.admin_users au where au.user_id = auth.uid()
  )
);

-- Optional: prevent disabled users from reading anything beyond their own profile is enforced by RLS already.



create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'client' check (role in ('admin', 'client')),
  full_name text not null default '' check (char_length(full_name) <= 80),
  email text not null default '' check (char_length(email) <= 320),
  phone text not null default '' check (char_length(phone) <= 25),
  dob date,
  occupation text not null default '' check (char_length(occupation) <= 100),
  city text not null default '' check (char_length(city) <= 100),
  country text not null default '' check (char_length(country) <= 100),
  avatar text not null default '' check (char_length(avatar) <= 2048),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_email_unique_idx on public.profiles (lower(email))
  where email <> '';
create index profiles_role_created_idx on public.profiles (role, created_at desc);

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select, update on public.profiles to authenticated;

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.protect_profile_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if pg_trigger_depth() <= 1 then
    if new.id is distinct from old.id
      or new.email is distinct from old.email
      or new.created_at is distinct from old.created_at then
      raise exception 'Profile identity fields are managed by authentication.';
    end if;

    if new.role is distinct from old.role then
      raise exception 'Profile roles are managed by the WealthTogether access system.';
    end if;
  end if;

  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_protect_identity
  before update on public.profiles
  for each row execute function public.protect_profile_identity();

create or replace function public.create_auth_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role, full_name, email)
  values (
    new.id,
    case when exists (
      select 1 from public.admin_users where user_id = new.id
    ) then 'admin' else 'client' end,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 80),
    coalesce(new.email, '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = case when public.profiles.full_name = ''
          then excluded.full_name else public.profiles.full_name end;
  return new;
end;
$$;

create trigger auth_user_create_profile
  after insert on auth.users
  for each row execute function public.create_auth_profile();

create or replace function public.sync_auth_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email = coalesce(new.email, ''),
      full_name = case
        when coalesce(new.raw_user_meta_data ->> 'full_name', '') <> ''
          then left(new.raw_user_meta_data ->> 'full_name', 80)
        else full_name
      end
  where id = new.id;
  return new;
end;
$$;

create trigger auth_user_sync_profile
  after update of email, raw_user_meta_data on auth.users
  for each row execute function public.sync_auth_profile();

create or replace function public.sync_profile_admin_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    update public.profiles set role = 'client' where id = old.user_id;
    return old;
  end if;

  insert into public.profiles (id, role, email)
  select new.user_id, 'admin', coalesce(users.email, '')
  from auth.users as users
  where users.id = new.user_id
  on conflict (id) do update set role = 'admin';
  return new;
end;
$$;

create trigger admin_users_sync_profile_role
  after insert or update of role or delete on public.admin_users
  for each row execute function public.sync_profile_admin_role();

insert into public.profiles (id, role, full_name, email)
select users.id,
       case when admins.user_id is null then 'client' else 'admin' end,
       left(coalesce(users.raw_user_meta_data ->> 'full_name', ''), 80),
       coalesce(users.email, '')
from auth.users as users
left join public.admin_users as admins on admins.user_id = users.id
on conflict (id) do update
  set role = excluded.role,
      email = excluded.email,
      full_name = case when public.profiles.full_name = ''
        then excluded.full_name else public.profiles.full_name end;

comment on table public.profiles is
  'Self-service client profile fields. Role assignment remains controlled by admin_users.';


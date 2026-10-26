create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'admin' check (role in ('owner', 'admin', 'advisor', 'viewer')),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
create policy "Administrators can read their own role"
  on public.admin_users for select
  to authenticated
  using ((select auth.uid()) = user_id);

create table public.crm_clients (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users (id) on delete set null,
  auth_user_id uuid unique references auth.users (id) on delete set null,
  name text not null check (char_length(trim(name)) between 2 and 100),
  phone text not null check (char_length(trim(phone)) between 7 and 25),
  email text not null check (char_length(trim(email)) between 3 and 320),
  city text not null default '' check (char_length(city) <= 100),
  occupation text not null default '' check (char_length(occupation) <= 100),
  goals text not null default '' check (char_length(goals) <= 3000),
  notes text not null default '' check (char_length(notes) <= 10000),
  follow_up_status text not null default 'none'
    check (follow_up_status in ('none', 'due', 'scheduled', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index crm_clients_name_idx on public.crm_clients (name);
create unique index crm_clients_email_unique_idx on public.crm_clients (lower(email));
create index crm_clients_follow_up_idx on public.crm_clients (follow_up_status, updated_at desc);

alter table public.crm_clients enable row level security;
revoke all on public.crm_clients from anon, authenticated;

create table public.crm_consultations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.crm_clients (id) on delete cascade,
  topic text not null check (char_length(trim(topic)) between 2 and 120),
  scheduled_at timestamptz not null,
  status text not null default 'booked'
    check (status in ('booked', 'completed', 'cancelled')),
  notes text not null default '' check (char_length(notes) <= 3000),
  created_at timestamptz not null default now()
);

create index crm_consultations_client_date_idx
  on public.crm_consultations (client_id, scheduled_at desc);
create index crm_consultations_status_date_idx
  on public.crm_consultations (status, scheduled_at asc);

alter table public.crm_consultations enable row level security;
revoke all on public.crm_consultations from anon, authenticated;

alter table public.consultation_requests
  add column client_id uuid references public.crm_clients (id) on delete set null;

alter table public.consultation_requests
  drop constraint if exists consultation_requests_status_check;
alter table public.consultation_requests
  add constraint consultation_requests_status_check
  check (status in ('pending', 'confirmed', 'cancelled', 'completed'));

create index consultation_requests_client_created_idx
  on public.consultation_requests (client_id, created_at desc);

create or replace function public.crm_attach_auth_user_to_client()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.crm_clients
  set auth_user_id = new.id
  where lower(email) = lower(new.email)
    and auth_user_id is null;
  return new;
end;
$$;

create trigger crm_attach_auth_user_after_signup
  after insert on auth.users
  for each row execute function public.crm_attach_auth_user_to_client();

create or replace function public.crm_match_client_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select auth_user.id into new.auth_user_id
  from auth.users as auth_user
  where lower(auth_user.email) = lower(new.email)
  limit 1;
  return new;
end;
$$;

create trigger crm_match_auth_user_before_save
  before insert or update of email on public.crm_clients
  for each row execute function public.crm_match_client_auth_user();

update public.crm_clients as client
set auth_user_id = auth_user.id
from auth.users as auth_user
where lower(client.email) = lower(auth_user.email)
  and client.auth_user_id is null;

create or replace function public.crm_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger crm_clients_updated_at
  before update on public.crm_clients
  for each row execute function public.crm_touch_updated_at();

comment on table public.crm_clients is
  'Private WealthTogether client records. Access is through the server-side admin CRM only.';
comment on table public.admin_users is
  'CRM access assignments. Provision the first owner manually from a trusted SQL session.';

-- After creating the first administrator in Supabase Auth, grant CRM access with:
-- insert into public.admin_users (user_id, role)
-- select id, 'owner' from auth.users where lower(email) = lower('admin@example.com');

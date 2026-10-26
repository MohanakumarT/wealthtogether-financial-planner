create table public.consultation_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 100),
  email text not null check (char_length(email) <= 320),
  phone text not null check (char_length(phone) between 7 and 25),
  topic text not null check (topic in ('retirement', 'investing', 'home', 'education', 'family', 'other')),
  preferred_date date not null,
  preferred_time text not null check (preferred_time in ('morning', 'midday', 'afternoon', 'evening')),
  time_zone text not null check (char_length(time_zone) between 1 and 80),
  notes text check (notes is null or char_length(notes) <= 1000),
  consented_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index consultation_requests_email_created_idx
  on public.consultation_requests (email, created_at desc);

alter table public.consultation_requests enable row level security;

revoke all on public.consultation_requests from anon, authenticated;
grant select, insert on public.consultation_requests to service_role;

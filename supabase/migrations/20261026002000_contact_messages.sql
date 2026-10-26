create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 100),
  email text not null check (char_length(email) <= 320),
  subject text not null check (subject in ('general', 'planning', 'calculator', 'account', 'consultation', 'other')),
  message text not null check (char_length(trim(message)) between 10 and 3000),
  consented_at timestamptz not null,
  status text not null default 'unread' check (status in ('unread', 'read', 'closed')),
  created_at timestamptz not null default now()
);

create index contact_messages_email_created_idx
  on public.contact_messages (email, created_at desc);

alter table public.contact_messages enable row level security;

revoke all on public.contact_messages from anon, authenticated;
grant select, insert on public.contact_messages to service_role;

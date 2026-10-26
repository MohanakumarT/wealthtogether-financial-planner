alter table public.profiles
  add column if not exists monthly_income numeric(16,2) not null default 0 check (monthly_income >= 0),
  add column if not exists current_monthly_sip numeric(16,2) not null default 0 check (current_monthly_sip >= 0),
  add column if not exists risk_profile text not null default 'not_assessed'
    check (risk_profile in ('conservative', 'moderate', 'aggressive', 'not_assessed'));

create table public.assistant_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New conversation' check (char_length(title) between 1 and 120),
  last_message_preview text not null default '' check (char_length(last_message_preview) <= 240),
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.assistant_messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(trim(content)) between 1 and 4000),
  created_at timestamptz not null default now(),
  foreign key (conversation_id, user_id)
    references public.assistant_conversations(id, user_id) on delete cascade
);

create index assistant_conversations_user_updated_idx
  on public.assistant_conversations(user_id, updated_at desc);
create index assistant_messages_conversation_created_idx
  on public.assistant_messages(conversation_id, user_id, created_at desc, id desc);

alter table public.assistant_conversations enable row level security;
alter table public.assistant_messages enable row level security;
revoke all on public.assistant_conversations, public.assistant_messages from public, anon, authenticated;
grant all on public.assistant_conversations, public.assistant_messages to service_role;
grant usage, select on sequence public.assistant_messages_id_seq to service_role;

create trigger assistant_conversations_updated_at
  before update on public.assistant_conversations
  for each row execute function public.crm_touch_updated_at();

comment on table public.assistant_conversations is
  'Private, user-owned WealthTogether assistant chat history, accessed through authenticated server APIs.';
comment on table public.assistant_messages is
  'Private chat messages. Calculator and financial snapshot context is not stored with the messages.';
comment on column public.profiles.current_monthly_sip is
  'User-entered current monthly SIP amount for educational financial planning context.';

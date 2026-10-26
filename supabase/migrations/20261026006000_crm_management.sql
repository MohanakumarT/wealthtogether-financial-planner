alter table public.crm_clients
  add column if not exists date_of_birth date,
  add column if not exists income numeric(16,2) not null default 0 check (income >= 0),
  add column if not exists risk_profile text not null default 'not_assessed'
    check (risk_profile in ('conservative', 'moderate', 'aggressive', 'not_assessed')),
  add column if not exists status text not null default 'lead'
    check (status in ('lead', 'interested', 'active', 'inactive')),
  add column if not exists priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  add column if not exists next_follow_up_at timestamptz,
  add column if not exists monthly_revenue numeric(16,2) not null default 0 check (monthly_revenue >= 0);

update public.crm_clients
set status = case when follow_up_status = 'completed' then 'active' else 'lead' end
where status = 'lead';

create index if not exists crm_clients_status_idx on public.crm_clients (status, updated_at desc);
create index if not exists crm_clients_next_follow_up_idx on public.crm_clients (next_follow_up_at)
  where next_follow_up_at is not null;

create table if not exists public.crm_client_goals (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.crm_clients(id) on delete cascade,
  goal_type text not null check (goal_type in ('retirement', 'education', 'house', 'car', 'emergency_fund', 'marriage', 'vacation', 'wealth_creation', 'other')),
  title text not null check (char_length(trim(title)) between 2 and 120),
  target_amount numeric(16,2) not null default 0 check (target_amount >= 0),
  current_amount numeric(16,2) not null default 0 check (current_amount >= 0),
  target_date date,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'paused')),
  notes text not null default '' check (char_length(notes) <= 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_client_investments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.crm_clients(id) on delete cascade,
  investment_type text not null check (investment_type in ('mutual_fund', 'sip', 'lumpsum')),
  name text not null check (char_length(trim(name)) between 2 and 120),
  invested_amount numeric(16,2) not null default 0 check (invested_amount >= 0),
  current_value numeric(16,2) not null default 0 check (current_value >= 0),
  monthly_sip numeric(16,2) not null default 0 check (monthly_sip >= 0),
  investment_date date,
  notes text not null default '' check (char_length(notes) <= 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_client_insurance (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.crm_clients(id) on delete cascade,
  insurance_type text not null check (insurance_type in ('life', 'health', 'term')),
  provider text not null default '' check (char_length(provider) <= 120),
  policy_name text not null check (char_length(trim(policy_name)) between 2 and 120),
  cover_amount numeric(16,2) not null default 0 check (cover_amount >= 0),
  annual_premium numeric(16,2) not null default 0 check (annual_premium >= 0),
  renewal_date date,
  notes text not null default '' check (char_length(notes) <= 3000),
  created_at timestamptz not null default now()
);

create table if not exists public.crm_client_activities (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.crm_clients(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  activity_type text not null check (activity_type in ('note', 'meeting', 'whatsapp', 'email', 'phone', 'follow_up', 'status_change', 'consultation')),
  title text not null check (char_length(trim(title)) between 2 and 160),
  details text not null default '' check (char_length(details) <= 10000),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.crm_tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.crm_clients(id) on delete cascade,
  assigned_to uuid references auth.users(id) on delete set null,
  title text not null check (char_length(trim(title)) between 2 and 160),
  details text not null default '' check (char_length(details) <= 3000),
  due_at timestamptz,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_client_documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.crm_clients(id) on delete cascade,
  uploaded_by uuid references auth.users(id) on delete set null,
  storage_path text not null unique,
  file_name text not null check (char_length(file_name) <= 255),
  mime_type text not null,
  file_size bigint not null check (file_size > 0 and file_size <= 10485760),
  created_at timestamptz not null default now()
);

create index if not exists crm_goals_client_idx on public.crm_client_goals(client_id, updated_at desc);
create index if not exists crm_investments_client_idx on public.crm_client_investments(client_id, investment_date desc);
create index if not exists crm_insurance_client_idx on public.crm_client_insurance(client_id, renewal_date);
create index if not exists crm_activities_client_idx on public.crm_client_activities(client_id, occurred_at desc);
create index if not exists crm_tasks_status_due_idx on public.crm_tasks(status, due_at);
create index if not exists crm_documents_client_idx on public.crm_client_documents(client_id, created_at desc);

create trigger crm_client_goals_updated_at
  before update on public.crm_client_goals
  for each row execute function public.crm_touch_updated_at();
create trigger crm_client_investments_updated_at
  before update on public.crm_client_investments
  for each row execute function public.crm_touch_updated_at();
create trigger crm_tasks_updated_at
  before update on public.crm_tasks
  for each row execute function public.crm_touch_updated_at();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'crm_client_goals', 'crm_client_investments', 'crm_client_insurance',
    'crm_client_activities', 'crm_tasks', 'crm_client_documents'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from anon, authenticated', table_name);
  end loop;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'crm-client-documents', 'crm-client-documents', false, 10485760,
  array['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

comment on column public.crm_clients.monthly_revenue is 'Monthly advisory revenue recorded for CRM dashboard reporting.';
comment on table public.crm_client_activities is 'Private, chronological CRM interaction history; access is through the protected server-side admin CRM.';
comment on table public.crm_client_documents is 'Private client document metadata for files stored in the private crm-client-documents bucket.';

create policy "CRM administrators can receive private invalidation events"
  on realtime.messages for select to authenticated
  using (
    extension = 'broadcast'
    and realtime.topic() = 'wealthtogether-crm'
    and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  );

create policy "CRM administrators can send private invalidation events"
  on realtime.messages for insert to authenticated
  with check (
    extension = 'broadcast'
    and realtime.topic() = 'wealthtogether-crm'
    and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  );

create or replace function public.crm_dashboard_financial_summary()
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'monthlyRevenue', coalesce((select sum(monthly_revenue) from public.crm_clients), 0),
    'totalAum', coalesce((select sum(current_value) from public.crm_client_investments), 0),
    'assetAllocation', coalesce((
      select jsonb_agg(jsonb_build_object('name', investment_type, 'value', amount) order by investment_type)
      from (
        select investment_type, sum(current_value) as amount
        from public.crm_client_investments
        group by investment_type
      ) as allocation
    ), '[]'::jsonb),
    'investmentTimeline', coalesce((
      select jsonb_agg(jsonb_build_object('month', month_key, 'label', month_label, 'value', amount) order by month_key)
      from (
        select
          to_char(months.month_start, 'YYYY-MM') as month_key,
          to_char(months.month_start, 'Mon') as month_label,
          coalesce(sum(investments.current_value), 0) as amount
        from generate_series(
          date_trunc('month', current_date) - interval '11 months',
          date_trunc('month', current_date),
          interval '1 month'
        ) as months(month_start)
        left join public.crm_client_investments as investments
          on date_trunc('month', investments.investment_date::timestamp) = months.month_start
        group by months.month_start
      ) as timeline
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.crm_dashboard_financial_summary() from public, anon, authenticated;
grant execute on function public.crm_dashboard_financial_summary() to service_role;

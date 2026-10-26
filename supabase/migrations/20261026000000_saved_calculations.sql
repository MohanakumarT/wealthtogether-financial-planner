create table public.saved_calculations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  calculator_id text not null,
  calculator_title text not null,
  name text not null check (char_length(trim(name)) between 1 and 80),
  inputs jsonb not null,
  results jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index saved_calculations_user_updated_idx
  on public.saved_calculations (user_id, updated_at desc);

alter table public.saved_calculations enable row level security;

revoke all on public.saved_calculations from anon;
grant select, insert, update, delete on public.saved_calculations to authenticated;

create policy "Users can read their saved calculations"
  on public.saved_calculations for select
  using ((select auth.uid()) = user_id);

create policy "Users can create their saved calculations"
  on public.saved_calculations for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update their saved calculations"
  on public.saved_calculations for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their saved calculations"
  on public.saved_calculations for delete
  using ((select auth.uid()) = user_id);

create or replace function public.set_saved_calculation_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger saved_calculations_updated_at
  before update on public.saved_calculations
  for each row execute function public.set_saved_calculation_updated_at();

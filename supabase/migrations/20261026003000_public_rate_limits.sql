create table public.public_rate_limits (
  key_hash text primary key check (key_hash ~ '^[0-9a-f]{64}$'),
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0),
  expires_at timestamptz not null
);

create index public_rate_limits_expires_idx
  on public.public_rate_limits (expires_at);

alter table public.public_rate_limits enable row level security;
revoke all on public.public_rate_limits from public, anon, authenticated, service_role;

create or replace function public.consume_public_rate_limit(
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_count integer;
begin
  if p_key_hash !~ '^[0-9a-f]{64}$'
    or p_limit < 1
    or p_limit > 1000
    or p_window_seconds < 1
    or p_window_seconds > 86400 then
    raise exception 'Invalid public rate limit parameters';
  end if;

  delete from public.public_rate_limits as expired
  where expired.expires_at <= v_now
    and expired.key_hash in (
      select candidates.key_hash
      from public.public_rate_limits as candidates
      where candidates.expires_at <= v_now
      order by candidates.expires_at
      limit 100
    );

  insert into public.public_rate_limits as current_limit (
    key_hash,
    window_started_at,
    request_count,
    expires_at
  )
  values (
    p_key_hash,
    v_now,
    1,
    v_now + p_window_seconds * interval '1 second'
  )
  on conflict (key_hash) do update
  set
    window_started_at = case
      when current_limit.expires_at <= v_now then v_now
      else current_limit.window_started_at
    end,
    request_count = case
      when current_limit.expires_at <= v_now then 1
      else current_limit.request_count + 1
    end,
    expires_at = case
      when current_limit.expires_at <= v_now
        then v_now + p_window_seconds * interval '1 second'
      else current_limit.expires_at
    end
  returning request_count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.consume_public_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_public_rate_limit(text, integer, integer)
  to service_role;

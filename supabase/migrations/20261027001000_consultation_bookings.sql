create table public.consultation_booking_sequences (
  year integer primary key check (year between 2020 and 9999),
  last_number bigint not null check (last_number > 0)
);

alter table public.consultation_booking_sequences enable row level security;
revoke all on public.consultation_booking_sequences from public, anon, authenticated;
grant all on public.consultation_booking_sequences to service_role;

create or replace function public.generate_consultation_booking_reference()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  reference_year integer := extract(year from (now() at time zone 'utc'))::integer;
  next_number bigint;
begin
  insert into public.consultation_booking_sequences (year, last_number)
  values (reference_year, 1)
  on conflict (year)
  do update set last_number = public.consultation_booking_sequences.last_number + 1
  returning last_number into next_number;

  return 'WT-' || reference_year::text || '-' ||
    case
      when next_number < 10000 then lpad(next_number::text, 4, '0')
      else next_number::text
    end;
end;
$$;

revoke all on function public.generate_consultation_booking_reference() from public, anon, authenticated;
grant execute on function public.generate_consultation_booking_reference() to service_role;

create table public.consultation_bookings (
  booking_id uuid primary key default gen_random_uuid(),
  booking_reference text not null unique default public.generate_consultation_booking_reference(),
  service text not null check (char_length(trim(service)) between 2 and 160),
  price numeric(14, 2) not null check (price >= 0),
  status text not null default 'Pending'
    check (status in ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
  name text not null check (char_length(trim(name)) between 2 and 100),
  email text not null check (char_length(email) between 3 and 320),
  phone text not null check (char_length(phone) between 7 and 25),
  whatsapp text not null check (char_length(whatsapp) between 7 and 25),
  age smallint not null check (age between 18 and 110),
  occupation text not null check (char_length(trim(occupation)) between 2 and 100),
  income numeric(14, 2) not null check (income >= 0),
  city text not null check (char_length(trim(city)) between 2 and 100),
  investment_experience boolean not null,
  monthly_sip numeric(14, 2) not null check (monthly_sip >= 0),
  financial_goals text[] not null check (
    cardinality(financial_goals) between 1 and 7
    and financial_goals <@ array[
      'Retirement',
      'House',
      'Car',
      'Kids Education',
      'Wealth Creation',
      'Emergency Fund',
      'Other'
    ]::text[]
  ),
  investment_budget numeric(14, 2) not null check (investment_budget >= 0),
  risk_profile text not null check (risk_profile in ('Conservative', 'Moderate', 'Aggressive')),
  preferred_date date not null,
  preferred_time text not null check (preferred_time in ('Morning', 'Afternoon', 'Evening')),
  meeting_mode text not null check (meeting_mode in ('Google Meet', 'Phone Call')),
  notes text check (notes is null or char_length(notes) <= 1500),
  consented_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index consultation_bookings_email_created_idx
  on public.consultation_bookings (email, created_at desc);
create index consultation_bookings_status_date_idx
  on public.consultation_bookings (status, preferred_date);

alter table public.consultation_bookings enable row level security;
revoke all on public.consultation_bookings from public, anon, authenticated;
grant select, insert, update, delete on public.consultation_bookings to service_role;

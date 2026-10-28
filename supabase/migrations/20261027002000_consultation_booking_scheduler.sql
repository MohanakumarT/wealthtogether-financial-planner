alter table public.consultation_bookings rename to bookings;
alter table public.bookings rename column status to booking_status;

alter table public.bookings
  add column time_zone text not null default 'Asia/Kolkata'
  check (char_length(time_zone) between 1 and 80);

alter table public.bookings
  drop constraint if exists consultation_bookings_preferred_time_check;

update public.bookings
set preferred_time = case preferred_time
  when 'Morning' then '10:00 AM'
  when 'Afternoon' then '2:00 PM'
  when 'Evening' then '6:30 PM'
  else preferred_time
end
where preferred_time in ('Morning', 'Afternoon', 'Evening');

alter table public.bookings
  add constraint bookings_preferred_time_check
  check (preferred_time in ('10:00 AM', '11:30 AM', '2:00 PM', '4:00 PM', '6:30 PM', '8:00 PM'));

alter table public.bookings
  add constraint bookings_preferred_weekday_check
  check (extract(isodow from preferred_date) between 1 and 6);

create unique index bookings_active_appointment_slot_unique
  on public.bookings (preferred_date, preferred_time)
  where booking_status in ('Pending', 'Confirmed');

notify pgrst, 'reload schema';

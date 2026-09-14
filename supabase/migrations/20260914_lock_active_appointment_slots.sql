create unique index if not exists appointments_active_slot_unique
on public.appointments (doctor_id, appointment_date, appointment_time)
where status is distinct from 'cancelled'
  and status is distinct from 'completed';
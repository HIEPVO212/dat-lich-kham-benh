alter table public.appointments
  add column if not exists reason text;

alter table public.appointments
  add column if not exists specialty text;

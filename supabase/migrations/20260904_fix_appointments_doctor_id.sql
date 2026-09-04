begin;

-- The doctor catalog uses integer doctor_id values. Keep appointments aligned
-- with that catalog instead of the old UUID-based profile reference.
alter table public.appointments
  drop constraint if exists appointments_doctor_id_fkey;

alter table public.appointments
  alter column doctor_id drop not null;

alter table public.appointments
  alter column doctor_id type bigint
  using null::bigint;

alter table public.appointments
  add constraint appointments_doctor_id_fkey
  foreign key (doctor_id) references public.doctor (doctor_id);

commit;

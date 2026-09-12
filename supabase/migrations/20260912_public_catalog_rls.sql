alter table public.doctor enable row level security;
drop policy if exists "public can view doctors" on public.doctor;
create policy "public can view doctors"
on public.doctor for select
to anon, authenticated
using (true);

alter table public.specialty enable row level security;
drop policy if exists "public can view specialties" on public.specialty;
create policy "public can view specialties"
on public.specialty for select
to anon, authenticated
using (true);

-- doctor_primary_facility is a view, so it uses grants instead of table RLS.
grant select on public.doctor_primary_facility to anon, authenticated;

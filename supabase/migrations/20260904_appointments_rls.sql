alter table public.appointments enable row level security;

create policy "patients can create their appointments"
on public.appointments for insert
to authenticated
with check (auth.uid() = patient_id);

create policy "patients and admins can view appointments"
on public.appointments for select
to authenticated
using (
  auth.uid() = patient_id
  or exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

create policy "patients can cancel their appointments"
on public.appointments for update
to authenticated
using (auth.uid() = patient_id)
with check (auth.uid() = patient_id);

create policy "admins can manage appointments"
on public.appointments for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

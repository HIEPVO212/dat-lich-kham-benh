create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.users
    where users.id = auth.uid()
      and users.role in ('admin', 'member')
  );
$$;

drop policy if exists "patients and admins can view appointments" on public.appointments;
create policy "patients and staff can view appointments"
on public.appointments for select
to authenticated
using (public.is_staff() or auth.uid() = patient_id);

drop policy if exists "patients can cancel their appointments" on public.appointments;
create policy "patients and staff can update appointments"
on public.appointments for update
to authenticated
using (public.is_staff() or auth.uid() = patient_id)
with check (public.is_staff() or auth.uid() = patient_id);

drop policy if exists "admins can read accounts" on public.users;
create policy "admins and staff can read accounts"
on public.users for select
to authenticated
using (public.is_staff());
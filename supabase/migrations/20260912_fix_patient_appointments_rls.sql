alter table public.appointments
    drop constraint if exists appointments_patient_id_fkey;

alter table public.appointments
    add constraint appointments_patient_id_fkey
    foreign key (patient_id) references auth.users(id);

create or replace function public.is_admin()
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
            and users.role = 'admin'
    );
$$;

alter table public.users enable row level security;
drop policy if exists "users can create own account" on public.users;
create policy "users can create own account"
on public.users for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "patients can create their appointments" on public.appointments;
create policy "patients can create their appointments"
on public.appointments for insert
to authenticated
with check (auth.uid() = patient_id);

drop policy if exists "patients and admins can view appointments" on public.appointments;
create policy "patients and admins can view appointments"
on public.appointments for select
to authenticated
using (public.is_admin() or auth.uid() = patient_id);

drop policy if exists "patients can cancel their appointments" on public.appointments;
create policy "patients can cancel their appointments"
on public.appointments for update
to authenticated
using (public.is_admin() or auth.uid() = patient_id)
with check (public.is_admin() or auth.uid() = patient_id);
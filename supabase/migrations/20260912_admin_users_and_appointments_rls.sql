-- Keep application authorization consistent with the public.users table.
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

alter table public.appointments enable row level security;

drop policy if exists "patients and admins can view appointments" on public.appointments;
create policy "patients and admins can view appointments"
on public.appointments for select
to authenticated
using (auth.uid() = patient_id or public.is_admin());

drop policy if exists "patients can cancel their appointments" on public.appointments;
create policy "patients can cancel their appointments"
on public.appointments for update
to authenticated
using (auth.uid() = patient_id or public.is_admin())
with check (auth.uid() = patient_id or public.is_admin());

drop policy if exists "admins can manage appointments" on public.appointments;

alter table public.users enable row level security;

drop policy if exists "users can read own account" on public.users;
create policy "users can read own account"
on public.users for select
to authenticated
using (id = auth.uid());

drop policy if exists "admins can read accounts" on public.users;
create policy "admins can read accounts"
on public.users for select
to authenticated
using (public.is_admin());

drop policy if exists "admins can update accounts" on public.users;
create policy "admins can update accounts"
on public.users for update
to authenticated
using (public.is_admin())
with check (role in ('admin', 'member', 'user'));

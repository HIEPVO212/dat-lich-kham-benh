alter table public.profiles enable row level security;

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

alter table public.doctor enable row level security;

drop policy if exists "public can view doctors" on public.doctor;
create policy "public can view doctors"
on public.doctor for select
to anon, authenticated
using (true);

drop policy if exists "admins can insert doctors" on public.doctor;
create policy "admins can insert doctors"
on public.doctor for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

drop policy if exists "admins can update doctors" on public.doctor;
create policy "admins can update doctors"
on public.doctor for update
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

drop policy if exists "admins can delete doctors" on public.doctor;
create policy "admins can delete doctors"
on public.doctor for delete
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

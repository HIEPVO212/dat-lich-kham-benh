drop policy if exists "admins can insert doctors" on public.doctor;
create policy "admins can insert doctors"
on public.doctor for insert
to authenticated
with check (public.is_admin());

drop policy if exists "admins can update doctors" on public.doctor;
create policy "admins can update doctors"
on public.doctor for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can delete doctors" on public.doctor;
create policy "admins can delete doctors"
on public.doctor for delete
to authenticated
using (public.is_admin());
drop policy if exists "admins can upload doctor avatars" on storage.objects;
create policy "admins can upload doctor avatars"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = 'doctors'
  and public.is_admin()
);

drop policy if exists "admins can update doctor avatars" on storage.objects;
create policy "admins can update doctor avatars"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = 'doctors'
  and public.is_admin()
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = 'doctors'
  and public.is_admin()
);
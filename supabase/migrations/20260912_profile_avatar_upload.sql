-- Allow users to update their own profile fields, including avatar_url.
drop policy if exists "users can update own account" on public.users;
create policy "users can update own account"
on public.users for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Create the avatar bucket when it is not present yet.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "users can upload own avatars" on storage.objects;
create policy "users can upload own avatars"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = 'profiles'
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists "users can update own avatars" on storage.objects;
create policy "users can update own avatars"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = 'profiles'
  and (storage.foldername(name))[2] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = 'profiles'
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists "users can delete own avatars" on storage.objects;
create policy "users can delete own avatars"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = 'profiles'
  and (storage.foldername(name))[2] = auth.uid()::text
);
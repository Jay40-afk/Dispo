-- Where the lead's photo lives once uploaded (public URL into the
-- lead-photos storage bucket below).
alter table public.leads
  add column if not exists photo_url text;

-- Storage bucket for property photos. Public read (so <img> tags just work
-- without signed URLs) but writes are locked to the owning user's folder.
insert into storage.buckets (id, name, public)
values ('lead-photos', 'lead-photos', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can view lead photos" on storage.objects;
create policy "Anyone can view lead photos"
  on storage.objects for select
  using (bucket_id = 'lead-photos');

drop policy if exists "Users can upload their own lead photos" on storage.objects;
create policy "Users can upload their own lead photos"
  on storage.objects for insert
  with check (
    bucket_id = 'lead-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update their own lead photos" on storage.objects;
create policy "Users can update their own lead photos"
  on storage.objects for update
  using (
    bucket_id = 'lead-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete their own lead photos" on storage.objects;
create policy "Users can delete their own lead photos"
  on storage.objects for delete
  using (
    bucket_id = 'lead-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

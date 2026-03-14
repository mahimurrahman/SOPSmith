create extension if not exists pgcrypto;

create table if not exists public.sop_files (
  id uuid primary key default gen_random_uuid(),
  sop_id uuid not null references public.sops(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  file_size integer not null,
  file_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists sop_files_sop_id_created_at_idx
on public.sop_files (sop_id, created_at desc);

grant usage on schema public to anon, authenticated, service_role;
revoke all on table public.sop_files from anon;
grant select, insert, update, delete on table public.sop_files to authenticated;
grant all on table public.sop_files to service_role;

alter table public.sop_files enable row level security;

drop policy if exists "Users can view their own SOP attachments" on public.sop_files;
create policy "Users can view their own SOP attachments"
on public.sop_files
for select
to authenticated
using (
  auth.uid() = (
    select public.sops.user_id
    from public.sops
    where public.sops.id = public.sop_files.sop_id
  )
);

drop policy if exists "Users can create their own SOP attachments" on public.sop_files;
create policy "Users can create their own SOP attachments"
on public.sop_files
for insert
to authenticated
with check (
  auth.uid() = (
    select public.sops.user_id
    from public.sops
    where public.sops.id = public.sop_files.sop_id
  )
);

drop policy if exists "Users can update their own SOP attachments" on public.sop_files;
create policy "Users can update their own SOP attachments"
on public.sop_files
for update
to authenticated
using (
  auth.uid() = (
    select public.sops.user_id
    from public.sops
    where public.sops.id = public.sop_files.sop_id
  )
)
with check (
  auth.uid() = (
    select public.sops.user_id
    from public.sops
    where public.sops.id = public.sop_files.sop_id
  )
);

drop policy if exists "Users can delete their own SOP attachments" on public.sop_files;
create policy "Users can delete their own SOP attachments"
on public.sop_files
for delete
to authenticated
using (
  auth.uid() = (
    select public.sops.user_id
    from public.sops
    where public.sops.id = public.sop_files.sop_id
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'attachments',
  'attachments',
  false,
  5242880,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]::text[]
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload their own SOP attachments" on storage.objects;
create policy "Users can upload their own SOP attachments"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'attachments'
  and exists (
    select 1
    from public.sops
    where public.sops.id::text = (storage.foldername(name))[1]
      and public.sops.user_id = auth.uid()
  )
);

drop policy if exists "Users can read their own SOP attachments" on storage.objects;
create policy "Users can read their own SOP attachments"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'attachments'
  and exists (
    select 1
    from public.sops
    where public.sops.id::text = (storage.foldername(name))[1]
      and public.sops.user_id = auth.uid()
  )
);

drop policy if exists "Users can update their own SOP attachments" on storage.objects;
create policy "Users can update their own SOP attachments"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'attachments'
  and exists (
    select 1
    from public.sops
    where public.sops.id::text = (storage.foldername(name))[1]
      and public.sops.user_id = auth.uid()
  )
)
with check (
  bucket_id = 'attachments'
  and exists (
    select 1
    from public.sops
    where public.sops.id::text = (storage.foldername(name))[1]
      and public.sops.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete their own SOP attachments" on storage.objects;
create policy "Users can delete their own SOP attachments"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'attachments'
  and exists (
    select 1
    from public.sops
    where public.sops.id::text = (storage.foldername(name))[1]
      and public.sops.user_id = auth.uid()
  )
);

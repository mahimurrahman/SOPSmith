create table if not exists public.sop_versions (
  id uuid primary key default gen_random_uuid(),
  sop_id uuid not null references public.sops (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists sop_versions_sop_id_created_at_idx
on public.sop_versions (sop_id, created_at desc);

alter table public.sop_versions enable row level security;

create policy "Users can view versions of their own SOPs"
on public.sop_versions
for select
to authenticated
using (
  exists (
    select 1 from public.sops
    where public.sops.id = public.sop_versions.sop_id
    and public.sops.user_id = auth.uid()
  )
);

create policy "Users can create versions of their own SOPs"
on public.sop_versions
for insert
to authenticated
with check (
  exists (
    select 1 from public.sops
    where public.sops.id = sop_id
    and public.sops.user_id = auth.uid()
  )
);

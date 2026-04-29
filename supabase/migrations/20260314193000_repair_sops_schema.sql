create extension if not exists pgcrypto;

create table if not exists public.sops (
  id uuid primary key default gen_random_uuid()
);

alter table public.sops
  add column if not exists user_id uuid,
  add column if not exists title text,
  add column if not exists raw_notes text,
  add column if not exists content text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'sops_user_id_fkey'
      and conrelid = 'public.sops'::regclass
  ) then
    alter table public.sops
      add constraint sops_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end;
$$;

update public.sops
set raw_notes = coalesce(nullif(raw_notes, ''), content, title, 'Imported legacy SOP')
where raw_notes is null or raw_notes = '';

update public.sops
set created_at = coalesce(created_at, now())
where created_at is null;

update public.sops
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

alter table public.sops alter column user_id set not null;
alter table public.sops alter column title set not null;
alter table public.sops alter column raw_notes set not null;
alter table public.sops alter column content set not null;
alter table public.sops alter column created_at set default now();
alter table public.sops alter column created_at set not null;
alter table public.sops alter column updated_at set default now();
alter table public.sops alter column updated_at set not null;

create table if not exists public.sop_versions (
  id uuid primary key default gen_random_uuid(),
  sop_id uuid not null references public.sops (id) on delete cascade,
  content text not null,
  structured_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.sop_versions
  add column if not exists structured_data jsonb not null default '{}'::jsonb;

create index if not exists sop_versions_sop_id_created_at_idx
on public.sop_versions (sop_id, created_at desc);

alter table public.sop_versions enable row level security;

drop policy if exists "Users can view versions of their own SOPs" on public.sop_versions;
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

drop policy if exists "Users can create versions of their own SOPs" on public.sop_versions;
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

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_sops_updated_at on public.sops;

create trigger set_sops_updated_at
before update on public.sops
for each row
execute function public.set_current_timestamp_updated_at();

create index if not exists sops_user_id_created_at_idx
on public.sops (user_id, created_at desc);

grant usage on schema public to anon, authenticated, service_role;
revoke all on table public.sops from anon;
grant select, insert, update, delete on table public.sops to authenticated;
grant all on table public.sops to service_role;

alter table public.sops enable row level security;

drop policy if exists "Users can view their own SOPs" on public.sops;
create policy "Users can view their own SOPs"
on public.sops
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their own SOPs" on public.sops;
create policy "Users can create their own SOPs"
on public.sops
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own SOPs" on public.sops;
create policy "Users can update their own SOPs"
on public.sops
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own SOPs" on public.sops;
create policy "Users can delete their own SOPs"
on public.sops
for delete
to authenticated
using (auth.uid() = user_id);

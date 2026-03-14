create extension if not exists pgcrypto;

create table if not exists public.sops (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  raw_notes text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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

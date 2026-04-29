alter table public.sops
  add column if not exists structured_data jsonb not null default '{}'::jsonb;

alter table public.sop_files
  add column if not exists extracted_text text;

alter table public.sop_versions
  add column if not exists structured_data jsonb not null default '{}'::jsonb;


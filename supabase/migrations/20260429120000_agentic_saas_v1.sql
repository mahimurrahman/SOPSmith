create extension if not exists pgcrypto;

-- Create the helper function FIRST, before any policies reference it
create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
  );
$$;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

alter table public.sops
  add column if not exists workspace_id uuid references public.workspaces (id) on delete cascade;

create index if not exists sops_workspace_id_created_at_idx
on public.sops (workspace_id, created_at desc);

create table if not exists public.plans (
  id text primary key,
  name text not null,
  monthly_price integer not null,
  sop_limit integer,
  agent_run_limit integer,
  created_at timestamptz not null default now()
);

insert into public.plans (id, name, monthly_price, sop_limit, agent_run_limit)
values
  ('free', 'Free', 0, 3, 5),
  ('starter', 'Starter', 19, 50, 100),
  ('pro', 'Pro', 49, 300, 1000),
  ('team', 'Team', 149, null, null)
on conflict (id) do update
set
  name = excluded.name,
  monthly_price = excluded.monthly_price,
  sop_limit = excluded.sop_limit,
  agent_run_limit = excluded.agent_run_limit;

create table if not exists public.workspace_subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade unique,
  plan_id text not null references public.plans (id),
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  current_period_start timestamptz not null default date_trunc('month', now()),
  current_period_end timestamptz not null default (date_trunc('month', now()) + interval '1 month'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  event_type text not null check (event_type in ('sop_created', 'agent_run', 'google_mock_action')),
  quantity integer not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  invoice_number text not null,
  plan_id text not null references public.plans (id),
  amount_due integer not null,
  status text not null default 'paid' check (status in ('draft', 'paid', 'void')),
  period_start timestamptz not null,
  period_end timestamptz not null,
  created_at timestamptz not null default now(),
  unique (workspace_id, invoice_number)
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  sop_id uuid references public.sops (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  agent_type text not null check (agent_type in ('sop_creation', 'sop_audit', 'sop_improvement', 'section_regeneration', 'google_mock')),
  status text not null default 'queued' check (status in ('queued', 'running', 'waiting_approval', 'completed', 'failed', 'cancelled')),
  title text not null,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_run_steps (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.agent_runs (id) on delete cascade,
  step_order integer not null,
  status text not null default 'completed' check (status in ('queued', 'running', 'completed', 'failed')),
  tool_name text not null,
  input_summary text not null,
  output_summary text,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_approvals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  run_id uuid references public.agent_runs (id) on delete cascade,
  sop_id uuid references public.sops (id) on delete cascade,
  approval_type text not null check (approval_type in ('sop_edit', 'google_action')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  title text not null,
  preview text not null,
  proposed_payload jsonb not null default '{}'::jsonb,
  decided_by uuid references auth.users (id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  provider text not null check (provider in ('google')),
  status text not null default 'mock_connected' check (status in ('mock_connected', 'disconnected')),
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, provider)
);

create table if not exists public.integration_actions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  integration_id uuid references public.integrations (id) on delete set null,
  run_id uuid references public.agent_runs (id) on delete set null,
  action_type text not null check (action_type in ('drive_export', 'docs_sync', 'gmail_draft')),
  status text not null default 'draft' check (status in ('draft', 'approved', 'rejected', 'completed')),
  destination text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.sop_health_scores (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  sop_id uuid not null references public.sops (id) on delete cascade unique,
  score integer not null check (score >= 0 and score <= 100),
  issues jsonb not null default '[]'::jsonb,
  last_audited_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workspace_members_user_id_idx on public.workspace_members (user_id);
create index if not exists usage_events_workspace_created_idx on public.usage_events (workspace_id, created_at desc);
create index if not exists agent_runs_workspace_created_idx on public.agent_runs (workspace_id, created_at desc);
create index if not exists agent_approvals_workspace_status_idx on public.agent_approvals (workspace_id, status, created_at desc);
create index if not exists integration_actions_workspace_created_idx on public.integration_actions (workspace_id, created_at desc);

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.plans enable row level security;
alter table public.workspace_subscriptions enable row level security;
alter table public.usage_events enable row level security;
alter table public.invoices enable row level security;
alter table public.agent_runs enable row level security;
alter table public.agent_run_steps enable row level security;
alter table public.agent_approvals enable row level security;
alter table public.integrations enable row level security;
alter table public.integration_actions enable row level security;
alter table public.sop_health_scores enable row level security;
alter table public.sops enable row level security;

drop policy if exists "Authenticated users can read plans" on public.plans;
create policy "Authenticated users can read plans"
on public.plans for select to authenticated using (true);

drop policy if exists "Users can create their own workspace" on public.workspaces;
create policy "Users can create their own workspace"
on public.workspaces for insert to authenticated
with check (auth.uid() = owner_user_id);

drop policy if exists "Members can view workspaces" on public.workspaces;
create policy "Members can view workspaces"
on public.workspaces for select to authenticated
using (
  owner_user_id = auth.uid()
  or exists (
    select 1 from public.workspace_members
    where workspace_members.workspace_id = workspaces.id
      and workspace_members.user_id = auth.uid()
  )
);

drop policy if exists "Owners can update workspaces" on public.workspaces;
create policy "Owners can update workspaces"
on public.workspaces for update to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

drop policy if exists "Members can view memberships" on public.workspace_members;
create policy "Members can view memberships"
on public.workspace_members for select to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.workspaces
    where workspaces.id = workspace_members.workspace_id
      and workspaces.owner_user_id = auth.uid()
  )
);

drop policy if exists "Owners can create memberships" on public.workspace_members;
create policy "Owners can create memberships"
on public.workspace_members for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.workspaces
    where workspaces.id = workspace_members.workspace_id
      and workspaces.owner_user_id = auth.uid()
  )
);

drop policy if exists "Members can read subscriptions" on public.workspace_subscriptions;
create policy "Members can read subscriptions"
on public.workspace_subscriptions for select to authenticated
using (
  exists (
    select 1 from public.workspace_members
    where workspace_members.workspace_id = workspace_subscriptions.workspace_id
      and workspace_members.user_id = auth.uid()
  )
);

drop policy if exists "Owners can manage subscriptions" on public.workspace_subscriptions;
create policy "Owners can manage subscriptions"
on public.workspace_subscriptions for all to authenticated
using (
  exists (
    select 1 from public.workspaces
    where workspaces.id = workspace_subscriptions.workspace_id
      and workspaces.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.workspaces
    where workspaces.id = workspace_subscriptions.workspace_id
      and workspaces.owner_user_id = auth.uid()
  )
);

drop policy if exists "Members can view workspaces" on public.workspaces;
create policy "Members can view workspaces"
on public.workspaces for select to authenticated
using (owner_user_id = auth.uid() or public.is_workspace_member(id));

drop policy if exists "Members can view memberships" on public.workspace_members;
create policy "Members can view memberships"
on public.workspace_members for select to authenticated
using (user_id = auth.uid() or public.is_workspace_member(workspace_id));

drop policy if exists "Users can view their own SOPs" on public.sops;
create policy "Users can view their own SOPs"
on public.sops
for select
to authenticated
using (auth.uid() = user_id or public.is_workspace_member(workspace_id));

drop policy if exists "Users can create their own SOPs" on public.sops;
create policy "Users can create their own SOPs"
on public.sops
for insert
to authenticated
with check (auth.uid() = user_id and (workspace_id is null or public.is_workspace_member(workspace_id)));

drop policy if exists "Users can update their own SOPs" on public.sops;
create policy "Users can update their own SOPs"
on public.sops
for update
to authenticated
using (auth.uid() = user_id or public.is_workspace_member(workspace_id))
with check (auth.uid() = user_id or public.is_workspace_member(workspace_id));

drop policy if exists "Users can delete their own SOPs" on public.sops;
create policy "Users can delete their own SOPs"
on public.sops
for delete
to authenticated
using (auth.uid() = user_id or public.is_workspace_member(workspace_id));

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
      and (public.sops.user_id = auth.uid() or public.is_workspace_member(public.sops.workspace_id))
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
      and (public.sops.user_id = auth.uid() or public.is_workspace_member(public.sops.workspace_id))
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
      and (public.sops.user_id = auth.uid() or public.is_workspace_member(public.sops.workspace_id))
  )
)
with check (
  bucket_id = 'attachments'
  and exists (
    select 1
    from public.sops
    where public.sops.id::text = (storage.foldername(name))[1]
      and (public.sops.user_id = auth.uid() or public.is_workspace_member(public.sops.workspace_id))
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
      and (public.sops.user_id = auth.uid() or public.is_workspace_member(public.sops.workspace_id))
  )
);

drop policy if exists "Users can view their own SOP attachments" on public.sop_files;
create policy "Users can view their own SOP attachments"
on public.sop_files
for select
to authenticated
using (
  exists (
    select 1 from public.sops
    where public.sops.id = public.sop_files.sop_id
      and (public.sops.user_id = auth.uid() or public.is_workspace_member(public.sops.workspace_id))
  )
);

drop policy if exists "Users can create their own SOP attachments" on public.sop_files;
create policy "Users can create their own SOP attachments"
on public.sop_files
for insert
to authenticated
with check (
  exists (
    select 1 from public.sops
    where public.sops.id = public.sop_files.sop_id
      and (public.sops.user_id = auth.uid() or public.is_workspace_member(public.sops.workspace_id))
  )
);

drop policy if exists "Users can update their own SOP attachments" on public.sop_files;
create policy "Users can update their own SOP attachments"
on public.sop_files
for update
to authenticated
using (
  exists (
    select 1 from public.sops
    where public.sops.id = public.sop_files.sop_id
      and (public.sops.user_id = auth.uid() or public.is_workspace_member(public.sops.workspace_id))
  )
)
with check (
  exists (
    select 1 from public.sops
    where public.sops.id = public.sop_files.sop_id
      and (public.sops.user_id = auth.uid() or public.is_workspace_member(public.sops.workspace_id))
  )
);

drop policy if exists "Users can delete their own SOP attachments" on public.sop_files;
create policy "Users can delete their own SOP attachments"
on public.sop_files
for delete
to authenticated
using (
  exists (
    select 1 from public.sops
    where public.sops.id = public.sop_files.sop_id
      and (public.sops.user_id = auth.uid() or public.is_workspace_member(public.sops.workspace_id))
  )
);

drop policy if exists "Members can manage usage events" on public.usage_events;
create policy "Members can manage usage events"
on public.usage_events for all to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

drop policy if exists "Members can read invoices" on public.invoices;
create policy "Members can read invoices"
on public.invoices for select to authenticated
using (public.is_workspace_member(workspace_id));

drop policy if exists "Members can create invoices" on public.invoices;
create policy "Members can create invoices"
on public.invoices for insert to authenticated
with check (public.is_workspace_member(workspace_id));

drop policy if exists "Members can manage agent runs" on public.agent_runs;
create policy "Members can manage agent runs"
on public.agent_runs for all to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

drop policy if exists "Members can manage agent steps" on public.agent_run_steps;
create policy "Members can manage agent steps"
on public.agent_run_steps for all to authenticated
using (
  exists (
    select 1 from public.agent_runs
    where agent_runs.id = agent_run_steps.run_id
      and public.is_workspace_member(agent_runs.workspace_id)
  )
)
with check (
  exists (
    select 1 from public.agent_runs
    where agent_runs.id = agent_run_steps.run_id
      and public.is_workspace_member(agent_runs.workspace_id)
  )
);

drop policy if exists "Members can manage approvals" on public.agent_approvals;
create policy "Members can manage approvals"
on public.agent_approvals for all to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

drop policy if exists "Members can manage integrations" on public.integrations;
create policy "Members can manage integrations"
on public.integrations for all to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

drop policy if exists "Members can manage integration actions" on public.integration_actions;
create policy "Members can manage integration actions"
on public.integration_actions for all to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

drop policy if exists "Members can manage SOP health" on public.sop_health_scores;
create policy "Members can manage SOP health"
on public.sop_health_scores for all to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

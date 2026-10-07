-- NEXA Multi-State / Multi-Server Workspace Registry
-- Prepared: 2026-10-07
-- Purpose:
--   Make NEXA workspace architecture extensible so current and future workspaces
--   can be registered once and automatically seeded into every State Hub.
--
-- Current registered workspaces:
--   NEXA
--   WOS Utilities
--   Transfer
--   Ministry
--
-- IMPORTANT:
--   This migration is idempotent-friendly and preserves existing State 1518 data.
--   The equivalent database migration has already been applied to the current
--   NEXA Supabase project. Keep this file as the repository/source-of-truth copy.

alter table public.nexa_state_workspaces
  drop constraint if exists nexa_state_workspaces_key_check;

alter table public.nexa_state_workspaces
  drop constraint if exists nexa_state_workspaces_key_format_check;

alter table public.nexa_state_workspaces
  add constraint nexa_state_workspaces_key_format_check
  check (workspace_key ~ '^[a-z][a-z0-9_]{1,63}$');

alter table public.nexa_state_workspaces
  add column if not exists route text,
  add column if not exists workspace_type text not null default 'workspace',
  add column if not exists is_system boolean not null default false;

update public.nexa_state_workspaces
set route='/index.html', workspace_type='portal', is_system=true
where workspace_key='nexa';

update public.nexa_state_workspaces
set route='/wos-utilities.html', is_system=true
where workspace_key='wos_utilities';

update public.nexa_state_workspaces
set route='/transfer-workspace.html', is_system=true
where workspace_key='transfer';

update public.nexa_state_workspaces
set route='/ministry-workspace.html', is_system=true
where workspace_key='ministry';

create table if not exists public.nexa_workspace_registry (
  workspace_key text primary key,
  display_name text not null,
  route text,
  workspace_type text not null default 'workspace',
  default_enabled boolean not null default true,
  sort_order integer not null default 100,
  is_system boolean not null default false,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nexa_workspace_registry_key_format_check
    check (workspace_key ~ '^[a-z][a-z0-9_]{1,63}$')
);

insert into public.nexa_workspace_registry
  (workspace_key, display_name, route, workspace_type, default_enabled, sort_order, is_system)
values
  ('nexa', 'NEXA', '/index.html', 'portal', true, 10, true),
  ('wos_utilities', 'WOS Utilities', '/wos-utilities.html', 'workspace', true, 20, true),
  ('transfer', 'Transfer', '/transfer-workspace.html', 'workspace', true, 30, true),
  ('ministry', 'Ministry', '/ministry-workspace.html', 'workspace', true, 40, true)
on conflict (workspace_key) do update
set
  display_name=excluded.display_name,
  route=excluded.route,
  workspace_type=excluded.workspace_type,
  default_enabled=excluded.default_enabled,
  sort_order=excluded.sort_order,
  is_system=excluded.is_system,
  updated_at=now();

create or replace function public.nexa_sync_workspace_registry()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  insert into public.nexa_state_workspaces(
    state_number,
    workspace_key,
    display_name,
    is_enabled,
    sort_order,
    route,
    workspace_type,
    is_system,
    settings
  )
  select
    s.state_number,
    new.workspace_key,
    new.display_name,
    new.default_enabled,
    new.sort_order,
    new.route,
    new.workspace_type,
    new.is_system,
    new.settings
  from public.state_hubs s
  on conflict(state_number,workspace_key) do update
  set
    display_name=excluded.display_name,
    route=excluded.route,
    workspace_type=excluded.workspace_type,
    is_system=excluded.is_system,
    updated_at=now();

  return new;
end
$$;

drop trigger if exists trg_nexa_sync_workspace_registry
on public.nexa_workspace_registry;

create trigger trg_nexa_sync_workspace_registry
after insert or update on public.nexa_workspace_registry
for each row
execute function public.nexa_sync_workspace_registry();

create or replace function public.nexa_seed_state_workspaces()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  insert into public.nexa_state_workspaces(
    state_number,
    workspace_key,
    display_name,
    is_enabled,
    sort_order,
    route,
    workspace_type,
    is_system,
    settings
  )
  select
    new.state_number,
    r.workspace_key,
    r.display_name,
    r.default_enabled,
    r.sort_order,
    r.route,
    r.workspace_type,
    r.is_system,
    r.settings
  from public.nexa_workspace_registry r
  on conflict(state_number,workspace_key) do nothing;

  return new;
end
$$;

drop trigger if exists trg_nexa_seed_state_workspaces
on public.state_hubs;

create trigger trg_nexa_seed_state_workspaces
after insert on public.state_hubs
for each row
execute function public.nexa_seed_state_workspaces();

insert into public.nexa_state_workspaces(
  state_number,
  workspace_key,
  display_name,
  is_enabled,
  sort_order,
  route,
  workspace_type,
  is_system,
  settings
)
select
  s.state_number,
  r.workspace_key,
  r.display_name,
  r.default_enabled,
  r.sort_order,
  r.route,
  r.workspace_type,
  r.is_system,
  r.settings
from public.state_hubs s
cross join public.nexa_workspace_registry r
on conflict(state_number,workspace_key) do nothing;

create or replace function public.nexa_register_workspace(
  p_workspace_key text,
  p_display_name text,
  p_route text default null,
  p_workspace_type text default 'workspace',
  p_default_enabled boolean default true,
  p_sort_order integer default 100,
  p_settings jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  k text;
begin
  k := lower(trim(coalesce(p_workspace_key,'')));

  if k !~ '^[a-z][a-z0-9_]{1,63}$' then
    raise exception 'invalid_workspace_key';
  end if;

  if nullif(trim(coalesce(p_display_name,'')),'') is null then
    raise exception 'display_name_required';
  end if;

  insert into public.nexa_workspace_registry(
    workspace_key,
    display_name,
    route,
    workspace_type,
    default_enabled,
    sort_order,
    settings
  )
  values(
    k,
    trim(p_display_name),
    nullif(trim(coalesce(p_route,'')),''),
    coalesce(nullif(trim(p_workspace_type),''),'workspace'),
    coalesce(p_default_enabled,true),
    coalesce(p_sort_order,100),
    coalesce(p_settings,'{}'::jsonb)
  )
  on conflict(workspace_key) do update
  set
    display_name=excluded.display_name,
    route=excluded.route,
    workspace_type=excluded.workspace_type,
    default_enabled=excluded.default_enabled,
    sort_order=excluded.sort_order,
    settings=excluded.settings,
    updated_at=now();

  return jsonb_build_object(
    'ok', true,
    'workspace_key', k
  );
end
$$;

alter table public.nexa_workspace_registry
  enable row level security;

drop policy if exists nexa_workspace_registry_authenticated_read
on public.nexa_workspace_registry;

create policy nexa_workspace_registry_authenticated_read
on public.nexa_workspace_registry
for select
to authenticated
using(true);

grant select
on public.nexa_workspace_registry
to authenticated;

drop function if exists public.nexa_state_workspace_catalog(integer);

create function public.nexa_state_workspace_catalog(
  p_state_number integer
)
returns table(
  state_number integer,
  workspace_key text,
  display_name text,
  is_enabled boolean,
  sort_order integer,
  linked_workspace_id uuid,
  route text,
  workspace_type text
)
language sql
stable
security invoker
set search_path=public
as $$
  select
    w.state_number,
    w.workspace_key,
    w.display_name,
    w.is_enabled,
    w.sort_order,
    w.linked_workspace_id,
    w.route,
    w.workspace_type
  from public.nexa_state_workspaces w
  where
    w.state_number=p_state_number
    and w.is_enabled=true
  order by
    w.sort_order,
    w.display_name;
$$;

grant execute
on function public.nexa_state_workspace_catalog(integer)
to authenticated;

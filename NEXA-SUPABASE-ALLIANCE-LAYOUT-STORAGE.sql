-- NEXA 1518 — Alliance Layout Storage
-- Run ONCE in Supabase Dashboard > SQL Editor.

create table if not exists public.alliance_layout_settings (
  alliance_id text primary key,
  preset_key text not null default 'forest_green',
  emblem_data_url text,
  updated_at timestamptz not null default now()
);

alter table public.alliance_layout_settings enable row level security;

-- Allow signed-in NEXA users to read saved alliance layout identities.
drop policy if exists "nexa_layout_read_authenticated" on public.alliance_layout_settings;
create policy "nexa_layout_read_authenticated"
on public.alliance_layout_settings
for select
to authenticated
using (true);

-- Allow signed-in NEXA users to create layout identities.
drop policy if exists "nexa_layout_insert_authenticated" on public.alliance_layout_settings;
create policy "nexa_layout_insert_authenticated"
on public.alliance_layout_settings
for insert
to authenticated
with check (true);

-- Allow signed-in NEXA users to update existing layout identities.
drop policy if exists "nexa_layout_update_authenticated" on public.alliance_layout_settings;
create policy "nexa_layout_update_authenticated"
on public.alliance_layout_settings
for update
to authenticated
using (true)
with check (true);

-- Keep updated_at current even when rows are edited outside this page.
create or replace function public.nexa_touch_alliance_layout_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_nexa_alliance_layout_updated_at
on public.alliance_layout_settings;

create trigger trg_nexa_alliance_layout_updated_at
before update on public.alliance_layout_settings
for each row
execute function public.nexa_touch_alliance_layout_updated_at();

grant select, insert, update on public.alliance_layout_settings to authenticated;

-- Refresh PostgREST schema cache immediately.
notify pgrst, 'reload schema';

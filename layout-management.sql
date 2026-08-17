-- NEXA Layout Management
create table if not exists public.alliance_layout_settings (
  alliance_id text primary key,
  preset_key text not null default 'forest_green',
  emblem_data_url text,
  updated_at timestamptz not null default now()
);

alter table public.alliance_layout_settings enable row level security;

drop policy if exists "layout settings read" on public.alliance_layout_settings;
create policy "layout settings read"
on public.alliance_layout_settings for select
to authenticated
using (true);

drop policy if exists "layout settings write" on public.alliance_layout_settings;
create policy "layout settings write"
on public.alliance_layout_settings for all
to authenticated
using (true)
with check (true);

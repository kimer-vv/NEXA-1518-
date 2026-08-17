-- ============================================================
-- NEXA V51 — SYSTEM OPERATIONS / MAINTENANCE MODE
-- Safe additive migration. Does not delete existing data.
-- ============================================================

create table if not exists public.nexa_system_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

alter table public.nexa_system_settings enable row level security;

-- System settings are intentionally NOT readable/writable by normal browser roles.
-- Vercel server functions use the service role after verifying the NEXA Owner.
revoke all on public.nexa_system_settings from anon, authenticated;

insert into public.nexa_system_settings(key,value)
values ('maintenance_mode','{"enabled":false}'::jsonb)
on conflict(key) do nothing;

comment on table public.nexa_system_settings is
'Owner-controlled global NEXA settings. Maintenance Mode is enforced by Vercel Routing Middleware.';

-- ============================================================
-- NEXA 1518 • PHASE 2B — REAL SUBMIT FOR ALL EVENT TYPES
-- Run AFTER NEXA-PHASE-2A-FINAL.sql
-- Safe/idempotent. Does not delete existing responses.
-- ============================================================

begin;

alter table public.battle_form_responses
  add column if not exists event_type_key text;

-- Preserve existing SvS rows.
update public.battle_form_responses
set event_type_key = 'svs'
where event_type_key is null or btrim(event_type_key) = '';

alter table public.battle_form_responses
  alter column event_type_key set default 'svs';

-- Link submissions to reusable Event Types.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'battle_form_responses_event_type_key_fkey'
  ) then
    alter table public.battle_form_responses
      add constraint battle_form_responses_event_type_key_fkey
      foreign key (event_type_key)
      references public.event_operation_types(event_key)
      on update cascade;
  end if;
end $$;

create index if not exists battle_form_responses_event_type_idx
  on public.battle_form_responses(event_type_key, created_at desc);

-- Authenticated players can submit their own Battle Form.
alter table public.battle_form_responses enable row level security;

drop policy if exists "battle responses authenticated insert" on public.battle_form_responses;
create policy "battle responses authenticated insert"
  on public.battle_form_responses
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- Players may read their own submissions; staff may read all.
drop policy if exists "battle responses own or staff read" on public.battle_form_responses;
create policy "battle responses own or staff read"
  on public.battle_form_responses
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.current_nexa_role() in ('owner','admin','scheduler')
  );

grant select, insert on public.battle_form_responses to authenticated;
grant usage, select on all sequences in schema public to authenticated;

commit;

-- Quick check:
-- select event_type_key, count(*)
-- from public.battle_form_responses
-- group by event_type_key
-- order by event_type_key;

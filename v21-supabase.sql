-- NEXA 1518 v21 — Castle + Presidency assignments
-- Run once in Supabase SQL Editor → New Query → Run.

alter table public.svs_events
add column if not exists castle_alliance_id bigint
references public.alliances(id)
on delete set null;

alter table public.svs_events
add column if not exists presidency_alliance_id bigint
references public.alliances(id)
on delete set null;

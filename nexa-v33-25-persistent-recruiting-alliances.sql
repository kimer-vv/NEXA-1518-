-- NEXA v33.25 — Persistent Recruiting Alliances
-- Run once in Supabase SQL Editor.
-- Recruiting alliances become global/persistent and no longer require an active Transfer Event.

begin;

-- Existing alliance rows must survive event archival/deletion.
alter table public.transfer_recruiting_alliances
  alter column transfer_event_id drop not null;

-- Remove any FK on transfer_event_id (especially ON DELETE CASCADE).
do $$
declare
  r record;
begin
  for r in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    join unnest(con.conkey) with ordinality cols(attnum, ord) on true
    join pg_attribute att on att.attrelid = rel.oid and att.attnum = cols.attnum
    where con.contype = 'f'
      and nsp.nspname = 'public'
      and rel.relname = 'transfer_recruiting_alliances'
      and att.attname = 'transfer_event_id'
  loop
    execute format(
      'alter table public.transfer_recruiting_alliances drop constraint %I',
      r.conname
    );
  end loop;
end $$;

-- Re-add the relationship as optional and non-destructive.
alter table public.transfer_recruiting_alliances
  add constraint transfer_recruiting_alliances_transfer_event_id_fkey
  foreign key (transfer_event_id)
  references public.transfer_events(id)
  on delete set null;

-- Detach existing recruiting alliances from old cycles so they remain reusable.
update public.transfer_recruiting_alliances
set transfer_event_id = null
where transfer_event_id is not null;

commit;
